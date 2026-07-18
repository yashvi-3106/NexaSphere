export const typeDefs = `#graphql
  type Event {
    id: ID!
    title: String
    description: String
    status: String
    location: String
    startDate: String
    endDate: String
    category: String
  }

  type PageInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type EventsPage {
    events: [Event!]!
    pagination: PageInfo!
  }

  type Query {
    events(page: Int = 1, limit: Int = 20, status: String): EventsPage!
    event(id: ID!): Event
  }
`;
