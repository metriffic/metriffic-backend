const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('./validators')
const { checkAuth } = require('./check_auth')
const { SECRET_KEY } = require('../config')

const SUBS_USER        = 'USER';
const SUBS_SESSION     = 'SESSION';
const SUBS_BOARD       = 'BOARD';
const SUBS_DOCKERIMAGE = 'DOCKERIMAGE';
const SUBS_PLATFORM    = 'PLATFORM';
function generateToken(user) {
    return  jwt.sign({
                id: user.id,
                email: user.email,
                username: user.username
            }, SECRET_KEY, {expiresIn: '1h'});
}

const resolvers = {
    Subscription: {    
        subsUser: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(SUBS_USER),
        },  
        subsSession: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(SUBS_SESSION),
        },  
        subsBoard: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(SUBS_BOARD),
        },  
        subsDockerImage: {      
            // Additional event labels can be passed to asyncIterator creation      
            subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(SUBS_DOCKERIMAGE),
        },  
        subsPlatform: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(SUBS_PLATFORM),
        }, 
    },

    Query: {
        async users (root, args, context) {
            console.log('context', context);
            return null;
        },
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
        async allPlatforms (root, args, { req, payload, models }) {
            const user = checkAuth(payload.authorization)
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
        async login(root, { username, password }, { models, pubsub }) {
            const {errors, valid} = validateLoginInput(username, password);
            if(!valid) {
                throw new UserInputError('Login error', {errors});
            }

            var user = null;

            return models.User.findOne({
                    where: {username:username}
            }).then(ret => {
                if (!ret) {
                    errors.general =  errors.general = 'Account with this username doesn\'t exists';
                    throw new UserInputError('Unknown username', { errors }); 
                }
                // TODO check if the user is enabled...
                return ret;
            }).then(ret => {
                user = ret;
                return bcrypt.compare(password, user.get().password);
            }).then(match => {
                if(!match) {
                    errors.general =  errors.general = 'Wrong Credentials';
                    throw new UserInputError('Wrong credentials', { errors }); 
                }                
                pubsub.publish(SUBS_USER, { subsUser: { mutation: 'LOGGEDIN', data: user.get() }});

                user.lastLoggedInAt = new Date().toISOString();
                user.currentState = 'loggedin';

                return user.save();
            }).then(() => {
                return user.reload();
            }).then(() => {
                const authuser = user.get();
                authuser.token = generateToken(authuser);
                return authuser;
            });
        },
        async register(root, { username, email, password, cpassword }, { models, pubsub }) {

            const {errors, valid} = validateRegisterInput(username, email, password, cpassword);
            if(!valid) {
                throw new UserInputError('Registration error', {errors});
            }

            return models.User.findOne({
                where: { username: username }
            }).then(user => {
                if (user) {
                    throw new UserInputError('Username is taken', {
                        errors : {
                            username: 'Account with this username already exists'
                        }
                    })
                }
                return;
            }).then(() => {
                return bcrypt.hash(password, 12)
            }).then(password => {
                const now = new Date().toISOString();
                return models.User.create({
                    email,
                    username,
                    password,
                    role: 'user',
                    createdAt: now,
                    lastLoggedInAt: now,
                    isEnabled: true,
                    currentState: 'loggedout'
                });    
            }).then(ret => {
                const token = generateToken(ret);
                const user = ret.get();
                user.token = token;
                pubsub.publish(SUBS_USER, { subsUser: { mutation: 'ADDED', data: user }});
                return user;
            });
        },
        async unregister(root, { username }, { models, pubsub }) {
            return models.User.findOne({
                where: { username: username }
            }).then(ret => {
                const user = ret.get();
                return ret.destroy()
                .then(() => {
                    pubsub.publish(SUBS_USER, { subsUser: { mutation: 'DELETED', data: user }});
                    return user;
                });
            }); 
        },
        async createPlatform (root, { name, description }, { models, pubsub }) {
            return models.Platform.create({
                name,
                description,
            }).then(ret => {
                pubsub.publish(SUBS_PLATFORM, { subsPlatform: { mutation: 'ADDED', data: ret.get() }});
                return ret;
            }); 
        },
        async createBoard (root, { platformId, hostname, description }, { models, pubsub }) {
            return models.Board.create({ 
                    platformId, 
                    hostname, 
                    description 
                }).then(ret => {
                    pubsub.publish(SUBS_BOARD, { subsBoard: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
        async createDockerImage (root, { platformId, name, description }, { models, pubsub }) {
            return models.DockerImage.create({ 
                    platformId, 
                    name, 
                    description 
                }).then(ret => {
                    pubsub.publish(SUBS_DOCKERIMAGE, { subsDockerImage: { mutation: 'ADDED', data: ret.get() }});
                    return ret;
                });            
        },
        async createSession (root, { platformId, dockerImageId, name, command, datasets, max_jobs }, { models, pubsub }) {
            return models.Session.create({ 
                    platformId, 
                    dockerImageId,
                    name, 
                    command,
                    datasets,
                    max_jobs
                }).then(ret => {
                    pubsub.publish(SUBS_SESSION, { subsSession: { mutation: 'ADDED', data: ret.get() }});

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
