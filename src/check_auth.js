const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server')
const { SECRET_KEY } = require('../config')

//I DONT NEED TO USE REQ HERE!
module.exports.checkAuth = (auth_token) => {
    //const auth_token = req.headers.authorization;
    if(auth_token) {
        const token = auth_token.split('Bearer ')[1];
        if(token) {
            try {
                user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch(err) {
                throw new AuthenticationError('Invalid/Expired token...')
            }
        }
        throw new Error('Authentication token must be \'Bearer [token]\'')
    }
    throw new Error('Authorization header must be provided')
}