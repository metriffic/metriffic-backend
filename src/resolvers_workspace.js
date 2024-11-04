const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');
const password_generator = require('generate-password');

module.exports = {
    Query: {
        async rsyncRequest (root, args, { payload, pubsub}) {
            const user = checkAuth(payload.authorization, payload.endpoint)
            pubsub.publish(Channel.RSYNC_REQUEST, { subsRSync: { username: user.username, public_key: user.user_key}});
            return true;
        },
    },
}
