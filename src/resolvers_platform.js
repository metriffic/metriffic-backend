const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');
const { UserInputError } = require('apollo-server');

module.exports = {
    Query: {
        async allPlatforms (root, args, { req, payload, models }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.Platform.findAll()
        },
        async allBoards (root, { platformName }, { models }) {
            if(platformName == null) {
                return models.Board.findAll();
            } else {
                return models.Platform.findOne({
                    where: {name: platformName}
                }).then(platform => {
                    if (!platform) {
                        const errors = {general: 'Unsupported platform'};
                        throw new UserInputError('Unknown platform', { errors }); 
                    }
                    return models.Board.findAll({
                        where: { platformId: platform.id }
                    })
                });
            }
        },
        async allDockerImages (root, { platformName, userId }, { models }) {
            if(platformName === "") {
                return models.DockerImage.findAll({ 
                    where: { [Op.or]: [{userId: ''}, {userId: userId}]}
                });
            } else {
                return models.Platform.findOne({
                    where: {
                        name: platformName,
                        [Op.or]: [{userId: ''}, {userId: userId}]
                    }
                }).then(platform => {
                    if (!platform) {
                        const errors = {general: 'Unsupported platform'};
                        throw new UserInputError('Unknown platform', { errors }); 
                    }
                    return models.DockerImage.findAll({
                        where: { platformId: platform.id }
                    })
                });
            }
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
        async boardCreate (root, { platformId, hostname, ip, description }, { models, pubsub }) {
            return models.Board.create({ 
                    platformId, 
                    hostname, 
		    ip,
                    description 
                }).then(ret => {
                    pubsub.publish(Channel.BOARD, { subsBoard: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
        async dockerImageCreate (root, { platformId, userId, name, options, description }, { models, pubsub }) {
            return models.Platform.findOne({
                where: {id: platformId}
            }).then(ret => {
                if (ret == null) {
                    const errors = { general: 'Unknown platform'};
                    throw new UserInputError('Platform id# \'' + platformId + '\' doesn\'t exists. Please choose one of the supported platforms.', { errors }); 
                }
                // platform exists, check dockerimage exists as well
                uplatform = ret.get();

                return models.DockerImage.create({ 
                        platformId, 
                        userId,
                        name, 
                        options,
                        description 
                    });
            }).then(ret => {
                    pubsub.publish(Channel.DOCKERIMAGE, { subsDockerImage: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
    },
}
