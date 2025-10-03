const server = require("./server");


const PORT = process.env.PORT || 4000;

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();