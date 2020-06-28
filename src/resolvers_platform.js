const { Channel }  = require('./resolvers_subscription');

module.exports = {
    Query: {
        async allPlatforms (root, args, { req, payload, models }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Platform.findAll()
        },
        async allBoards (root, { platformId }, { models }) {
            return models.Board.findAll({
                where: { platformId: platformId }
            })
        },
        async allDockerImages (root, { platformId }, { models }) {
            return models.DockerImage.findAll({
                where: { platformId: platformId }
            })
        },
      },
    Mutation: {
        async platformCreate (root, { name, description }, { models, pubsub }) {
            return models.Platform.create({
                name,
                description,
            }).then(ret => {
                pubsub.publish(Channel.PLATFORM, { subsPlatform: { mutation: 'ADDED', data: ret.get() }});
                return ret;
            }); 
        },
        async boardCreate (root, { platformId, hostname, description }, { models, pubsub }) {
            return models.Board.create({ 
                    platformId, 
                    hostname, 
                    description 
                }).then(ret => {
                    pubsub.publish(Channel.BOARD, { subsBoard: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
        async dockerImageCreate (root, { platformId, name, options, description }, { models, pubsub }) {
            return models.DockerImage.create({ 
                    platformId, 
                    name, 
                    options,
                    description 
                }).then(ret => {
                    pubsub.publish(Channel.DOCKERIMAGE, { subsDockerImage: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
    },
}
