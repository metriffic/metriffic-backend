const typeDefs = require('./src/schema')
const resolvers = require('./src/resolvers')
const models = require('./models')
const { PubSub, ApolloServer } = require('apollo-server')
const { HOSTNAME, PORT } = require('./config')

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
  .listen(PORT)
  .then(({ url }) => {
    console.log('URL',url);
    const mparams = {
      GQL_ENDPOINT:  "http://" + HOSTNAME + ":" + PORT + "/graphql",
    };
    console.log('Started the server is on ', mparams.GQL_ENDPOINT);
  });

  
