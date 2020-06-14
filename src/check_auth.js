//https://www.pingidentity.com/en/company/blog/posts/2019/jwt-security-nobody-talks-about.html
const jwt = require('jsonwebtoken')
const fs  = require('fs');
const { AuthenticationError } = require('apollo-server')
const { SECRET_KEY, AUTH_ALGORITHM, GRID_SERVICE_PUBLIC_KEY } = require('../config')



// use 'utf8' to get string instead of byte array  (512 bit key)
var grid_service_public_key  = fs.readFileSync(GRID_SERVICE_PUBLIC_KEY, 'utf8'); 


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
                    key = SECRET_KEY;
                } else
                if(endpoint == "grid_service") {
                    key = grid_service_public_key;
                }
                user = jwt.verify(token, key, verifyOptions);
                return user;
            } catch(err) {
                throw new AuthenticationError('Invalid/Expired token...')
            }
        }
        throw new Error('Authentication token must be \'Bearer [token]\'')
    }
    throw new Error('Authorization header must be provided')
}