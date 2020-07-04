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
                        throw new UserInputError('Unknown platform', { errors }); 
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
        
        async sessionCreate (root, { platformId, dockerImageId, name, type, command, datasets, max_jobs }, { models, pubsub, payload }) { 
            const user = checkAuth(payload.authorization, payload.endpoint);
            return models.Session.create({ 
                    platformId, 
                    userId : user.id,
                    dockerImageId,
                    name, 
                    type,
                    state : 'SUBMITTED', 
                    command,
                    datasets,
                    max_jobs
                }).then(session => {
                    pubsub.publish(Channel.SESSION, { subsSession: { mutation: 'ADDED', data: session.get() }});
                    return session;
                }); 
        },

        async sessionUpdate (root, { sessionId, state }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Session.findOne({
                where: {id: sessionId}
            }).then(session => {
                if (!session) {
                    const errors = { general: 'Session doesn\'t exist' };
                    throw new UserInputError('Unknown session', { errors }); 
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
            }).then(ret => {
                return ret;
            });
        },

    },
}
