const app = require('./api/index.js');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`GraphQL Program running locally!`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`GraphQL Endpoint: http://localhost:${PORT}/graphql`);
  console.log(`=========================================`);
});
