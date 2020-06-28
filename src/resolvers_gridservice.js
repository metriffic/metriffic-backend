const { Channel }  = require('./resolvers_subscription');
const { checkAuth } = require('./check_auth');

user_is_grid_service = (user) => {
    return user.who === 'grid_service';
} 

module.exports = {
    Mutation: {
        async publishData (root, { username, data }, { models, pubsub, payload }) {
            const user = checkAuth(payload.authorization, payload.endpoint);
            if(user_is_grid_service(user)) {
                console.log('published data', username, data);
                pubsub.publish(Channel.DATA + '#' + username, { subsData: { message: data }});
                return true;
            } else {
                return false;
            }
        },
    },
}
