//https://www.pingidentity.com/en/company/blog/posts/2019/jwt-security-nobody-talks-about.html
const jwt = require('jsonwebtoken')
const fs  = require('fs');
const apollo = require('apollo-server')
const config = require('../config')


// use 'utf8' to get string instead of byte array  (512 bit key)
let grid_service_public_key  = undefined; 
let workspace_manager_public_key  = undefined; 

module.exports.initAuth = () => {
    grid_service_public_key  = fs.readFileSync(config.GRID_SERVICE_PUBLIC_KEY_FILE, 'utf8'); 
    workspace_manager_public_key  = fs.readFileSync(config.WORKSPACE_MANAGER_PUBLIC_KEY_FILE, 'utf8'); 
}

//I DONT NEED TO USE REQ HERE!
module.exports.checkAuth = (auth_token, endpoint) => {
    //const auth_token = req.headers.authorization;
    if(auth_token) {
        const token = auth_token.split('Bearer ')[1];
        if(token) {
            try {
                const verifyOptions = {
                    //issuer:  i,
                    //subject:  s,
                    //audience:  a,
                    expiresIn:  "24h",
                    //algorithm:  [AUTH_ALGORITHM]
                   };
                var key = "";
                if(endpoint == "cli") {
                    key = config.SECRET_KEY;
                } else
                if(endpoint == config.GRID_SERVICE_ENDPOINT) {
                    key = grid_service_public_key;
                } else 
                if(endpoint == config.WORKSPACE_MANAGER_ENDPOINT) {
                    key = workspace_manager_public_key;
                } 
                
                user = jwt.verify(token, key, verifyOptions);
                return user;
            } catch(err) {
                throw new apollo.AuthenticationError('invalid/expired token...')
            }
        }
        throw new Error('authentication token must be in \'Bearer [token]\' format')
    }
    throw new Error('user not logged in')
}