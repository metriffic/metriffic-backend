const typeDefs = require('./src/schema')
const resolvers = require('./src/resolvers')
const models = require('./models')
const { PubSub, ApolloServer } = require('apollo-server')
const { GQL_HOSTNAME, GQL_PORT } = require('./config')

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
  .listen(GQL_PORT)
  .then(({ url }) => {
    console.log('URL',url);
    const mparams = {
      GQL_URL:  "http://" + GQL_HOSTNAME + ":" + GQL_PORT + "/graphql",
    };
    console.log('Started the server is on ', mparams.GQL_URL);
  });

  
