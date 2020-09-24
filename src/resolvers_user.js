const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('./validators')
const { checkAuth } = require('./check_auth')
const { Roles, States } = require('../models/user')
const { SECRET_KEY, AUTH_ALGORITHM } = require('../config')

const { Channel }  = require('./resolvers_subscription');
const { Statement } = require('sqlite3')


function generateToken(user) {
    const signOptions = {
        //issuer:  i,
        //subject:  s,
        //audience:  a,
        //algorithm:  AUTH_ALGORITHM,
        expiresIn:  "24h",
       };
    return  jwt.sign({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }, SECRET_KEY, signOptions);
}

module.exports = {
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
                pubsub.publish(Channel.USER, { subsUser: { mutation: States.LOGGEDIN, data: user.get() }});

                user.lastLoggedInAt = new Date().toISOString();
                user.currentState = States.LOGGEDIN;

                return user.save();
            }).then(() => {
                return user.reload();
            }).then(() => {
                const authuser = user.get();
                authuser.token = generateToken(authuser);
                return authuser;
            });
        },

        async logout(root, { }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            return models.User.findOne({
                    where: {username:user.username}
            }).then(ret => {
                const user = ret;
                pubsub.publish(Channel.USER, { subsUser: { mutation: States.LOGGEDOUT, data: user.get() }});
                user.currentState = States.LOGGEDOUT;
                return user.save();
            }).then(ret => {
                return ret.get().username;
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
                    role: Roles.USER,
                    createdAt: now,
                    lastLoggedInAt: now,
                    isEnabled: true,
                    currentState: State.LOGGEDIN
                });    
            }).then(ret => {
                const token = generateToken(ret);
                const user = ret.get();
                user.token = token;
                pubsub.publish(Channel.USER, { subsUser: { mutation: 'ADDED', data: user }});
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
                    pubsub.publish(Channel.USER, { subsUser: { mutation: 'DELETED', data: user }});
                    return user;
                });
            }); 
        },
        
    },
}