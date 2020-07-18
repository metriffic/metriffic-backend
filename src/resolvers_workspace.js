const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');
const password_generator = require('generate-password');

module.exports = {
    Query: {
        async rsyncRequest (root, args, { payload, pubsub}) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            const password = password_generator.generate({
                                                    length: 20,
                                                    numbers: true
                                                });            
            pubsub.publish(Channel.RSYNC_REQUEST, { subsRSync: { username: user.username, password: password }});
            return password;
        },
    },
}
