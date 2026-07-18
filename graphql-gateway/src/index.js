import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.GATEWAY_PORT || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
});

console.log(`GraphQL gateway ready at ${url}`);
