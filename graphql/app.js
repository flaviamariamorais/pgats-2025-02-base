const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();
const userService = require('../src/services/userService');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    let userData = null;
    if (auth.startsWith('Bearer ')) {
      const token = auth.replace('Bearer ', '');
      userData = userService.verifyToken(token);
    }
    return { userData };
  }
});

async function startApollo() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

   // ✅ Rota de verificação para o CI
  app.get('/', (req, res) => {
    res.status(200).send('Servidor GraphQL está rodando 🚀');
  });
  
}

startApollo();

module.exports = app;
