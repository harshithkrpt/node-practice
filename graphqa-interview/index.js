import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import pool from "./server/db.js";

const typeDefs = `
    type User {
        id: ID!
        name: String!
        email: String!
        created_at: String!
    }

    type Todo {
        id: ID!
        title: String!
        completed: Boolean!
        userId: ID!
        created_at: String!
    }

    type Query {
        me: User
        users: [User!]!
        user(id: ID!): User!
    }
`;

const resolvers = {
  Query: {
   me: () => {
      return {
        id: 1,
        name: "Harshith Kurapati",
        email: "harshith.krpt@gmail.com",
        created_at: `${new Date().toUTCString()}`
      }
   },
   users: async () => {
    const [rows] = await pool.query(`SELECT id, name, email, created_at FROM users LIMIT 100;`);
    if(rows.length) {
        return rows;
    }
    return []
   },
   user: async (_, { id }) => {
    const [rows] = await pool.query(`SELECT id, name, email, created_at FROM users WHERE id = ?`, [id]);

    if(!rows.length) {
      throw new Error("user not found");
    }

    return rows[0];

   }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: { 
    port: 4000
  }
});

console.log("🚀 Server running at:", url);