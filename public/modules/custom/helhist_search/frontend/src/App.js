import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';
import { API_URL } from './constants/constants.js';
import SearchContainer from './components/SearchContainer';

const apolloClient = new ApolloClient({
  uri: API_URL + '/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          searchAPISearch: {
            keyArgs: ["fulltext", "sort", "facets", "condition_group"],
            merge(existing, incoming, { args }) {
              // Slicing is necessary because the existing data is
              // immutable, and frozen in development.
              const merged = existing ? existing.slice(0) : [];
              // Insert the incoming elements in the right places, according to args.
              const end = args.range.offset + Math.min(args.range.limit, incoming.length);
              for (let i = args.range.offset; i < end; ++i) {
                merged[i] = incoming[i - args.range.offset];
              }
              return merged;
            },
            read(existing, { args }) {
              // If we read the field before any data has been written to the
              // cache, this function will return undefined, which correctly
              // indicates that the field is missing.
              const page = existing && existing.slice(
                args.range.offset,
                args.range.offset + args.range.limit,
              );
              // If we ask for a page outside the bounds of the existing array,
              // page.length will be 0, and we should return undefined instead of
              // the empty array.
              if (page && page.length > 0) {
                return page;
              }
            },
          }
        }
      }
    }
  }),
  connectToDevTools: true,
})

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <SearchContainer />
    </ApolloProvider>
  );
}

export default App;
