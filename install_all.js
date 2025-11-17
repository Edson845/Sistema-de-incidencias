const concurrently = require("concurrently");

concurrently([
  { command: "cd backend && npm install", name: "backend" },
  { command: "cd frontend && npm install", name: "frontend" },
  { command: "cd nlp && py -m pip install flask joblib scikit-learn", name: "nlp" }
], 
{
  prefix: "name",
  killOthersOn: ["failure"]
});
