const { API_VERSION } = require('../config');

module.exports = {
    Query: {
        async handshake () {
            console.log('handshake', API_VERSION) 
            return {api_version: API_VERSION}
        },
    }
}
