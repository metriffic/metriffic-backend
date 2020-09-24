const { Channel }  = require('./resolvers_subscription');
const { Roles } = require('../models/user')
const { checkAuth } = require('./check_auth');
const { UserInputError } = require('apollo-server');

module.exports = {
    Mutation: {
        async adminRequest (root, { command, data }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint);
            if(user.role != Roles.ADMIN) {
                throw new Error('the command requires administrative privileges...')
            }
            pubsub.publish(Channel.ADMIN, { subsAdmin: { 
                                              username: user.username,
                                              command: command, 
                                              data: data 
                                            }
                                        });
            return true;
        },
    },
}
