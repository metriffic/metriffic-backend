const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');
const op = require('sequelize').Op
const { UserInputError } = require('apollo-server');


module.exports =  {
    Query: {
        async allSessions (root, { platformName, status}, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint);
            // for cli endpoint its the actual user id, for grid-service it's null
            const filter = user.id ? [ { userId: user.id } ] : [];
            
            if(status.length) {
                const status_filter = []
                status.forEach(s => { status_filter.push( { state : s } ) })
                filter.push( {[op.or] : status_filter } )
            } 

            if(!platformName) {
                return models.Session.findAll( { 
                    where : { [op.and] : filter } 
                });
            } else {
                return models.Platform.findOne({
                    where: {name: platformName}
                }).then(platform => {
                    if (!platform) {
                        const errors = { general:  'Unsupported platform' };
                        throw new UserInputError('Platform \'' + platformName + '\' is not supported.', { errors }); 
                    }
                    filter.push({ platformId: platform.id });
                    return models.Session.findAll({
                        where: { [op.and] : filter }
                    })
                });
            }
        },
        async sessionStatus (root, { name }, { models, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            var session_state = undefined;
            return models.Session.findOne({
                where: {name: name}
            }).then(session => {
                if (!session) {
                    const errors = { general: 'Unknown session' };
                    throw new UserInputError('Session doesn\'t exist.', { errors }); 
                }
                session_state = session.state;
                return models.Job.findAll({
                    where: { sessionId: session.id }
                })
            }).then(jobs => {
                return {jobs: jobs, state: session_state}
            });
        },
    },

    Mutation: {
        
        async sessionCreate (root, { platform, dockerimage, name, type, command, datasets, max_jobs }, { models, pubsub, payload }) { 
            const user = checkAuth(payload.authorization, payload.endpoint);
            var uplatform = null;
            var udockerimage = null;
            return models.Session.findOne({
                where: {name: name}
            }).then(ret => {
                if (ret) {
                    const errors = { general: 'Duplicate session'};
                    throw new UserInputError('Session \'' + name + '\' exists. Please choose a different name.', { errors }); 
                }
                // session name is unique, check if the platform exists
                return models.Platform.findOne({
                    where: {name: platform}
                });
            }).then(ret => {
                if (ret == null) {
                    const errors = { general: 'Unknown platform'};
                    throw new UserInputError('Platform \'' + platform + '\' doesn\'t exists. Please choose one of the supported platforms.', { errors }); 
                }
                // platform exists, check dockerimage exists as well
                uplatform = ret.get();
                return models.DockerImage.findOne({
                    where: {name: dockerimage}
                });
            }).then(ret => {
                if (ret == null) {
                    const errors = { general: 'Unknown docker image'};
                    throw new UserInputError('Docker image \'' + dockerimage + '\' doesn\'t exists. Please choose one of the existing images.', { errors }); 
                }                                
                udockerimage = ret.get();
                if(udockerimage.platformId != uplatform.id) {
                    const errors = { general: 'Incompatible docker image'};
                    throw new UserInputError('Docker image \'' + dockerimage + '\' is not compatible with platform \'' + platform + '\'.', { errors }); 
                }
                udockeroptions = udockerimage.options;
                return models.Session.create({ 
                    platformId : uplatform.id, 
                    userId : user.id,
                    dockerImageId : udockerimage.id,
                    name, 
                    type: type.toUpperCase(),
                    state : 'SUBMITTED', 
                    command,
                    datasets,
                    max_jobs
                });                    
            }).then(session => {
                const data = {
                    username: user.username,
                    user_key: user.user_key,
                    session_id: session.id, 
                    session_name : session.name,
                    session_type: session.type, 
                    platform_id: uplatform.id,
                    docker_image: udockerimage.name,
                    docker_options: udockerimage.options,
                    command: session.command,
                    datasets: session.datasets,
                    max_jobs: session.max_jobs,
                };
                pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'ADDED', data: JSON.stringify(data) }});
                return session;
            }); 
        },

        async sessionUpdate (root, { name, state }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Session.findOne({
                where: {name: name}
            }).then(session => {
                if (!session) {
                    const errors = { general: 'Unknown session' };
                    throw new UserInputError('Session doesn\'t exist.', { errors }); 
                }
                session.state = state;
                // TBD: this has redundant data, consider trimming.
                const data = {
                    username: user.username,
                    session_id: session.id, 
                    session_name : session.name,
                    session_type: session.type,                     
                    session_state: session.state,
                    platform_id: session.platformId,
                };
                pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'UPDATED', data: JSON.stringify(data) }});
                return session.save();
            }).then(session => {
                return session.reload(); 
            });
        },

        async sessionSave (root, { name, dockerimage, description }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Session.findOne({
                where: {name: name}
            }).then(session => {
                if (!session) {
                    const errors = { general: 'Unknown session' };
                    throw new UserInputError('Session doesn\'t exist.', { errors }); 
                }
                if (session.type != "INTERACTIVE") {
                    const errors = { general: 'Can not save' };
                    throw new UserInputError('Can only save docker-images for interactive sessions.', { errors });     
                }
                if (session.state != "RUNNING") {
                    const errors = { general: 'Can not save' };
                    throw new UserInputError('Can only save docker-images for running sessions.', { errors });     
                }

                const data = {
                    username: user.username,
                    session_id: session.id, 
                    session_name: session.name,
                    docker_image: dockerimage,
                    platform_id: session.platformId,
                };

                pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'REQUESTED_SAVE', data: JSON.stringify(data) }});
                return {status: "Request to save docker-image for session " + session.name + " is submitted..."};
            });
        },

        async jobCreate (root, { sessionId, datasets }, { models, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            const datasets_parsed = JSON.parse(datasets);
                const submitted_jobs = [];
                const promises = datasets_parsed.map(dataset => {
                return models.Job.create({ 
                    sessionId, 
                    dataset,
                    state : 'SUBMITTED'
                }).then(job => {
                    submitted_jobs.push(job);
                });
            });
            return Promise.all(promises).then(() => { return submitted_jobs });
        },

        async jobUpdate (root, { id, state }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Job.findOne({
                where: {id: id}
            }).then(job => {
                if (!job) {
                    const errors = { general: 'Unknown job' };
                    throw new UserInputError('Job doesn\'t exist.', { errors }); 
                }
                job.state = state;
                pubsub.publish(Channel.JOB, { subsJob : { mutation: 'UPDATED', data: job.get() }});
                return job.save();
            }).then(job => {
                return job.reload(); 
            });
        },

    },
}
