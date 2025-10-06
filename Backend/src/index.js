import server from "./server.js";

const PORT = process.env.PORT || 4000;

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
  });
};

startServer();
