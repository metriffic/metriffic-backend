const { withFilter } = require('graphql-subscriptions');
const { checkAuth } = require('./check_auth');

const Channel = {
    USER        : 'USER',
    SESSION     : 'SESSION',
    JOB         : 'JOB',
    BOARD       : 'BOARD',
    DOCKERIMAGE : 'DOCKERIMAGE',
    PLATFORM    : 'PLATFORM',   
    DATA        : 'DATA',
    ADMIN       : 'ADMIN',
    RSYNC_REQUEST : 'RSYNC_REQUEST', 
}   

const AllSubscriptions = {    
    subsUser: {
        // Additional event labels can be passed to asyncIterator creation
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.USER),
    },  
    subsSession: {      
        // Additional event labels can be passed to asyncIterator creation      
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.SESSION),
    }, 
    subsJob: {      
        // Additional event labels can be passed to asyncIterator creation      
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.JOB),
    },  
    subsBoard: {      
        // Additional event labels can be passed to asyncIterator creation      
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.BOARD),
    },  
    subsDockerImage: {      
        // Additional event labels can be passed to asyncIterator creation      
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.DOCKERIMAGE),
    },  
    subsPlatform: {
        // Additional event labels can be passed to asyncIterator creation
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.PLATFORM),
    }, 
    subsAdmin: {      
        // Additional event labels can be passed to asyncIterator creation      
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.ADMIN),
    },     
    subsRSync: {
        // Additional event labels can be passed to asyncIterator creation
        subscribe: (root, args, { pubsub }) => pubsub.asyncIterator(Channel.RSYNC_REQUEST),
    }, 
    subsData: {
        subscribe: (root, args, { pubsub, payload}) => {
            const user = checkAuth(payload.authorization, payload.endpoint);
            return  pubsub.asyncIterator(Channel.DATA + '#' + user.username);
        },

        // Additional event labels can be passed to asyncIterator creation
        /*subscribe: withFilter(
                        (root, args, { pubsub }) => pubsub.asyncIterator(Channel.DATA),
                        (payload, variables, context, info) => {
                            console.log('-------------P', payload)
                            //console.log('-------------V', variables)
                            console.log('-------------Cpubsub', context.pubsub)
                            console.log('-------------Cpayload', context.payload)
                            //console.log('-------------I', info)
                            return true
                        })*/
    }, 
}

module.exports.Channel = Channel;
module.exports.AllSubscriptions = AllSubscriptions;
