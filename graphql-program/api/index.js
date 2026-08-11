// --------------------------------------------------------------------------
// 1. IMPORTS & DEPENDENCIES
// --------------------------------------------------------------------------
const express = require('express'); // Web framework to host the server
const cors = require('cors');       // Enable Cross-Origin Resource Sharing (allows front-end to talk to backend)
const { buildSchema } = require('graphql'); // Utility from graphql library to define the data structures
const { createHandler } = require('graphql-http/lib/use/express'); // Express integration for handling GraphQL HTTP requests
const path = require('path');       // Node utility to work with file directory paths

// --------------------------------------------------------------------------
// 2. GRAPHQL SCHEMA DEFINITION (The "Contract" of the API)
// --------------------------------------------------------------------------
// This block defines the shapes of data that client can query, and the methods available.
const schema = buildSchema(`
  # The Product type defines what a 'Product' looks like. 
  # The '!' means the field is required and can never be null.
  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    description: String!
  }

  # The Query type defines the entry points (methods) available to search for data.
  # Here we define 'findProduct', which takes a required ID parameter,
  # and returns a 'Product' object (or null if not found).
  type Query {
    findProduct(id: ID!): Product
  }
`);

// --------------------------------------------------------------------------
// 3. MOCK DATABASE (In-Memory Data Store)
// --------------------------------------------------------------------------
// Since we are not running a separate SQL/Mongo server, this JavaScript object
// acts as our database table. Each key corresponds to a product ID.
const productsDb = {
  "P101": {
    id: "P101",
    name: "AeroCore Wireless Headphones",
    category: "Electronics",
    price: 189.99,
    stock: 45,
    description: "Premium noise-cancelling wireless headphones with hybrid active noise cancellation, smart touch controls, and up to 40 hours of battery life."
  },
  "P102": {
    id: "P102",
    name: "Zenith Ergonomic Desk Chair",
    category: "Office Furniture",
    price: 349.50,
    stock: 12,
    description: "High-back ergonomic chair featuring an adaptive lumbar support system, breathable 3D mesh backing, and multi-dimensional armrests."
  },
  "P103": {
    id: "P103",
    name: "Titanium Trail Hiking Boots",
    category: "Footwear",
    price: 159.00,
    stock: 28,
    description: "Waterproof, rugged outdoor hiking boots constructed with full-grain leather, reinforced toe caps, and high-traction Vibram outsoles."
  },
  "P104": {
    id: "P104",
    name: "HydraPulse Smart Water Bottle",
    category: "Fitness Accessories",
    price: 49.95,
    stock: 85,
    description: "Self-cleaning insulated water bottle with integrated UV-C purification, real-time temperature display, and water intake reminder alerts."
  },
  "P105": {
    id: "P105",
    name: "Nebula Pro 4K Projector",
    category: "Home Theater",
    price: 899.00,
    stock: 8,
    description: "Ultra-short throw 4K UHD home theater projector delivering 2500 ANSI lumens, HDR10 compatibility, and built-in Dolby Audio speakers."
  }
};

// --------------------------------------------------------------------------
// 4. GRAPHQL RESOLVERS (The Controller/Logic)
// --------------------------------------------------------------------------
// Resolvers are functions that contain the logic to fetch the actual data
// matching the queries declared in the schema.
const root = {
  // This resolver runs when a query requests 'findProduct(id: "P101")'
  findProduct: ({ id }) => {
    // Looks up the ID in our mock database object and returns it, or null if it doesn't exist
    return productsDb[id] || null;
  }
};

// --------------------------------------------------------------------------
// 5. SERVER INITIALIZATION & ROUTING
// --------------------------------------------------------------------------
const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Enable JSON parsing for incoming request bodies

// Mount the GraphQL HTTP middleware to the '/graphql' endpoint.
// It maps incoming HTTP queries to our schema and executes the resolver logic.
app.all('/graphql', createHandler({
  schema: schema,     // The contract definition
  rootValue: root,    // The resolver functions
}));

// Route handler to serve the static frontend webpage (HTML, CSS, JS) from the public directory.
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app; // Export the app for local execution or Vercel serverless integration

