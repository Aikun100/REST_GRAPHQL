const app = require('./api/index.js');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`REST API Program running locally!`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`REST API Endpoint: http://localhost:${PORT}/api/tasks`);
  console.log(`=========================================`);
});
