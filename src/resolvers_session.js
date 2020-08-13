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
        async allJobs (root, { sessionId }, { models }) {
            return models.Board.findAll({
                where: { sessionId: sessionId }
            })
        },
      },

    Mutation: {
        
        async sessionCreate (root, { platform, dockerimage, name, type, command, datasets, max_jobs }, { models, pubsub, payload }) { 
            const user = checkAuth(payload.authorization, payload.endpoint);
            var uplatform = null;
            var udockerimage = null
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
                    pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'ADDED', data: session.get() }});
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
                pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'UPDATED', data: session.get() }});
                return session.save();
            }).then(session => {
                return session.reload(); 
            });
        },

        async jobCreate (root, { sessionId, dataset }, { models }) {
            return models.Job.create({ 
                sessionId, 
                dataset,
                state : 'SUBMITTED'
            }).then(ret => {
                return ret;
            });
        },

        async jobUpdate (root, { jobId, state }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Job.findOne({
                where: {jobId: jobId}
            }).then(job => {
                if (!job) {
                    const errors = { general: 'Unknown job' };
                    throw new UserInputError('Job doesn\'t exist.', { errors }); 
                }
                job.state = state;
                pubsub.publish(Channel.JOB, { subsJob : { mutation: 'UPDATED', data: job.get() }});
                return job.save();
            }).then(session => {
                return job.reload(); 
            });
        },

    },
}
