import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "https://beta.pokeapi.co/graphql/v1beta",
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      pokemon: {
        keyFields: ["id"],
      },
    },
  }),
  devtools: {
    enabled: true,
  },
});
