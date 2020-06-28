const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('./validators');
const { checkAuth } = require('./check_auth');
const { SECRET_KEY, AUTH_ALGORITHM } = require('../config');

const UserResolvers = require('./resolvers_user');
const SessionResolvers = require('./resolvers_session')
const PlatformResolvers = require('./resolvers_platform')
const GridServiceResolvers = require('./resolvers_gridservice')
const { Channel, AllSubscriptions }  = require('./resolvers_subscription');

const resolvers = {
    Subscription: {
        ...AllSubscriptions,
    },

    Query: {
        ...PlatformResolvers.Query,
        ...SessionResolvers.Query,

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
        ...UserResolvers.Mutation,
        ...PlatformResolvers.Mutation,
        ...SessionResolvers.Mutation,

        // this is only allowed from 
        ...GridServiceResolvers.Mutation,
        
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
        },
        async user(session, {}, {models}) { // ERROR 
            //return session.getDockerImage()
            return models.User.findByPk(session.userId)
                .then(function(ret){
                    return ret;
                });
        }
    }
}

module.exports = resolvers
