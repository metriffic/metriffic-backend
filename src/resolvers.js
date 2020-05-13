const bcrypt = require('bcryptjs')
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();

const SESSION_ADDED     = 'SESSION_ADDED';
const BOARD_ADDED       = 'BOARD_ADDED';
const DOCKERIMAGE_ADDED = 'DOCKERIMAGE_ADDED';
const PLATFORM_ADDED    = 'PLATFORM_ADDED';

const resolvers = {
    Subscription: {    
        sessionAdded: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: () => pubsub.asyncIterator(SESSION_ADDED),
        },  
        boardAdded: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: () => pubsub.asyncIterator(BOARD_ADDED),
        },  
        dockerImageAdded: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: () => pubsub.asyncIterator(DOCKERIMAGE_ADDED),
        },  
        platformAdded: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: () => pubsub.asyncIterator(PLATFORM_ADDED),
        },  
    },

    Query: {
        async platform (root, { id }, { models }) {
            return models.Platform.findByPk(id)
        },
        async board (root, { id }, { models }) {
            return models.Board.findByPk(id)
        },
        async dockerImage(root, { id }, { models }) {
            return models.DockerImage.findByPk(id)
        },
        async session (root, { id }, { models }) {
            return models.Session.findByPk(id)
        },
        async job (root, { id }, { models }) {
            return models.Job.findByPk(id)
        },
        async allPlatforms (root, args, { models }) {
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
        async allSessions (root, {platformId}, { models }) {
            return platformId == -1 ? models.Session.findAll()
                                    : models.Session.findAll({where: { 
                                                platformId: platformId }});
        },
        async allJobs (root, {sessionId}, { models }) {
            return models.Board.findAll({
                where: { sessionId: sessionId }
            })
        },
      },
    Mutation: {
        async createPlatform (root, { name, description }, { models }) {
            return models.Platform.create({
                name,
                description,
            }).then(ret => {
                pubsub.publish(PLATFORM_ADDED, {platformAdded: ret.get()});
                return ret;
            }); 
        },
        async createBoard (root, { platformId, hostname, description }, { models }) {
            return models.Board.create({ 
                    platformId, 
                    hostname, 
                    description 
                }).then(ret => {
                    pubsub.publish(BOARD_ADDED, {boardAdded: ret.get()});
                    return ret;
                });            
        },
        async createDockerImage (root, { platformId, name, description }, { models }) {
            return models.DockerImage.create({ 
                    platformId, 
                    name, 
                    description 
                }).then(ret => {
                    pubsub.publish(DOCKERIMAGE_ADDED, {dockerImageAdded: ret.get()});
                    return ret;
                });            
        },
        async createSession (root, { platformId, dockerImageId, name, command, datasets, max_jobs }, { models }) {
            return models.Session.create({ 
                    platformId, 
                    dockerImageId,
                    name, 
                    command,
                    datasets,
                    max_jobs
                }).then(ret => {
                    pubsub.publish(SESSION_ADDED, {sessionAdded: ret.get()});
                    return ret;
                }); 
        },
        async createJob (root, { sessionId, dataset }, { models }) {
            return models.Job.create({ 
                sessionId, 
                dataset,
            }).then(ret => {
                return ret;
            });
        }
    },
    Platform: {
        async boards (platform) {
            return platform.getBoards()
        }
    },
    Board: {
        async platform (board, {}, {models}) {
            return models.Platform.findByPk(board.platformId)
                .then(function(ret){
                    return ret;
                });
        }
    },
    DockerImage: {
        async platform (dockerImage, {}, {models}) {
            return models.Platform.findByPk(dockerImage.platformId)
                .then(function(ret){
                    return ret;
                });
        }
    },
    Job: {
        async session (job) {
            return models.Session.findByPk(job.sessionId)
                .then(function(ret){
                    return ret;
                });
        }
    },
    Session: {
        async jobs(session, {}, {models}) {
            //return session.getJobs()
            return models.Job.findAll({
                where: { sessionId: session.id }
            })
        },
        async platform(session, {}, {models}) { 
            //return session.getPlatform()
            return models.Platform.findByPk(session.platformId)
                .then(function(ret){
                    return ret;
                });
        },
        async dockerImage(session, {}, {models}) { // ERROR 
            //return session.getDockerImage()
            return models.DockerImage.findByPk(session.dockerImageId)
                .then(function(ret){
                    return ret;
                });
        }
    }
}

module.exports = resolvers
