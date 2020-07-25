const typeDefs = require('./src/schema')
const resolvers = require('./src/resolvers')
const models = require('./models')
const config = require('./config')
const { initAuth } = require('./src/check_auth');
const { PubSub, ApolloServer } = require('apollo-server')

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req, payload}) => ({
              req, 
              models,
              pubsub,
              payload
            })
})

server
  .listen(config.GQL_PORT)
  .then(({ url }) => {
    initAuth();
    console.log('Started the server is on ', "http://" + config.GQL_HOSTNAME + ":" + config.GQL_PORT + "/graphql");
  });

  
