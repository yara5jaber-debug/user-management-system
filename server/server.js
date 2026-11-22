
const jsonServer = require("json-server");
const auth = require("json-server-auth");
const cors = require("cors");

const app = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Connect the database to the application
app.db = router.db;

// Enable CORS
app.use(cors());

// Default middlewares
app.use(middlewares);

// Authentication middleware
app.use(auth);

// API routes
app.use(router);

// Start server
const PORT = 3007;

app.listen(PORT, () => {
  console.log(
    `JSON Server Auth running at http://localhost:${PORT}`
  );
});
