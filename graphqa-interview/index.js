// index.js
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import pool from "./server/db.js"; // your mysql2 pool export
import bcrypt from "bcryptjs";

/*
  Schema + resolvers for users and todos.
  - passwords are accepted on create/update but never returned to clients.
  - all DB calls use parameterized queries to avoid injection.
*/

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
    users(limit: Int = 100, offset: Int = 0): [User!]!
    user(id: ID!): User!

    todos(limit: Int = 100, offset: Int = 0): [Todo!]!
    todosByUser(userId: ID!, limit: Int = 100, offset: Int = 0): [Todo!]!
    todo(id: ID!): Todo!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User!
    updateUser(id: ID!, name: String, email: String, password: String): User!
    deleteUser(id: ID!): Boolean!

    createTodo(userId: ID!, title: String!): Todo!
    updateTodo(id: ID!, title: String, completed: Boolean): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    me: () => ({
      id: 1,
      name: "Harshith Kurapati",
      email: "harshith.krpt@gmail.com",
      created_at: `${new Date().toUTCString()}`,
    }),

    users: async (_, { limit = 100, offset = 0 }) => {
      const [rows] = await pool.query(
        `SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );
      return rows || [];
    },

    user: async (_, { id }) => {
      const [rows] = await pool.query(
        `SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) throw new Error("user not found");
      return rows[0];
    },

    todos: async (_, { limit = 100, offset = 0 }) => {
      const [rows] = await pool.query(
        `SELECT id, title, completed, user_id AS userId, created_at FROM todos ORDER BY id DESC LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );
      // convert completed (TINYINT) to boolean
      return (rows || []).map((r) => ({
        ...r,
        completed: Boolean(r.completed),
      }));
    },

    todosByUser: async (_, { userId, limit = 100, offset = 0 }) => {
      const [rows] = await pool.query(
        `SELECT id, title, completed, user_id AS userId, created_at FROM todos WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
        [userId, Number(limit), Number(offset)]
      );
      return (rows || []).map((r) => ({ ...r, completed: Boolean(r.completed) }));
    },

    todo: async (_, { id }) => {
      const [rows] = await pool.query(
        `SELECT id, title, completed, user_id AS userId, created_at FROM todos WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) throw new Error("todo not found");
      const row = rows[0];
      return { ...row, completed: Boolean(row.completed) };
    },
  },

  Mutation: {
    createUser: async (_, { name, email, password }) => {
      // basic validation
      if (!name || !email || !password) {
        throw new Error("name, email and password are required");
      }

      // check existing email
      const [existing] = await pool.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
      if (existing.length) {
        throw new Error("email already in use");
      }

      const password_hash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
        [name, email, password_hash]
      );

      const insertId = result.insertId;
      const [rows] = await pool.query(
        `SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1`,
        [insertId]
      );

      return rows[0];
    },

    updateUser: async (_, { id, name, email, password }) => {
      // fetch user first
      const [rows] = await pool.query(`SELECT id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (!rows.length) throw new Error("user not found");

      // Build dynamic update
      const fields = [];
      const params = [];
      if (name !== undefined) {
        fields.push("name = ?");
        params.push(name);
      }
      if (email !== undefined) {
        fields.push("email = ?");
        params.push(email);
      }
      if (password !== undefined) {
        const password_hash = await bcrypt.hash(password, 10);
        fields.push("password_hash = ?");
        params.push(password_hash);
      }

      if (fields.length) {
        params.push(id);
        await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
      }

      const [updated] = await pool.query(
        `SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      return updated[0];
    },

    deleteUser: async (_, { id }) => {
      const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    },

    createTodo: async (_, { userId, title }) => {
      // ensure user exists
      const [u] = await pool.query(`SELECT id FROM users WHERE id = ? LIMIT 1`, [userId]);
      if (!u.length) throw new Error("user not found");

      const [result] = await pool.query(
        `INSERT INTO todos (user_id, title) VALUES (?, ?)`,
        [userId, title]
      );
      const insertId = result.insertId;
      const [rows] = await pool.query(
        `SELECT id, title, completed, user_id AS userId, created_at FROM todos WHERE id = ? LIMIT 1`,
        [insertId]
      );
      const row = rows[0];
      return { ...row, completed: Boolean(row.completed) };
    },

    updateTodo: async (_, { id, title, completed }) => {
      const [rows] = await pool.query(`SELECT id FROM todos WHERE id = ? LIMIT 1`, [id]);
      if (!rows.length) throw new Error("todo not found");

      const fields = [];
      const params = [];
      if (title !== undefined) {
        fields.push("title = ?");
        params.push(title);
      }
      if (completed !== undefined) {
        // MySQL uses tinyint(1) for boolean
        fields.push("completed = ?");
        params.push(completed ? 1 : 0);
      }

      if (fields.length) {
        params.push(id);
        await pool.query(`UPDATE todos SET ${fields.join(", ")} WHERE id = ?`, params);
      }

      const [updated] = await pool.query(
        `SELECT id, title, completed, user_id AS userId, created_at FROM todos WHERE id = ? LIMIT 1`,
        [id]
      );
      const row = updated[0];
      return { ...row, completed: Boolean(row.completed) };
    },

    deleteTodo: async (_, { id }) => {
      const [result] = await pool.query(`DELETE FROM todos WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
});

console.log("🚀 Server running at:", url);
