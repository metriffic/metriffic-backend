const schema = require('./src/schema')
const resolvers = require('./src/resolvers')
const models = require('./models')
const config = require('./config')
const { initAuth } = require('./src/check_auth');
const { PubSub, ApolloServer } = require('apollo-server')

const pubsub = new PubSub();

const server = new ApolloServer({
  schema,
  resolvers,
  playground: false,
  introspection: false,
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
    console.log('Started the server is on port ', config.GQL_PORT);
  });

  
