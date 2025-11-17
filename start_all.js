const concurrently = require("concurrently");

concurrently(
  [
    {
      command: "cd backend && npm run dev",
      name: "backend",
    },
    {
      command: "cd frontend && npm start",
      name: "frontend",
    },
    {
      command: "cd nlp && python nlp_server.py",
      name: "nlp",
    }
  ],
  {
    prefix: "name",
    killOthers: ["failure"],
  }
);
