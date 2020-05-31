const { ApolloServer } = require('apollo-server')
const typeDefs = require('./src/schema')
const resolvers = require('./src/resolvers')
const models = require('./models')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({req, models}) 
})

const HOSTNAME = "localhost";
const PORT = 4000;

server
  .listen(PORT)
  .then(({ url }) => {
    console.log('URL',url);
    const mparams = {
      GQL_ENDPOINT:  "http://" + HOSTNAME + ":" + PORT + "/graphql",
    };
    console.log('Started the server is on ', mparams.GQL_ENDPOINT);
  });

  
