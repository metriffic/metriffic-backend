const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');

module.exports =  {
    Query: {
        async allSessions (root, { platformId }, { models }) {
            return platformId == -1 ? models.Session.findAll()
                                    : models.Session.findAll({where: { 
                                                platformId: platformId }});
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
            console.log('BLAAA', user)
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
            //const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Session.findOne({
                where: {id: sessionId}
            }).then(session => {
                if (!session) {
                    errors.general =  errors.general = 'Session doesn\'t exist';
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
