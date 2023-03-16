const port = 9000;
const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const server = require('./module/server')();

app.use(require("cors")());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.static("../web"));
require("./module/websocket")(httpServer, server);
require("./module/http")(app, port, server);

server.start();
httpServer.listen(port, () => {
  console.log("Listening on: http://localhost:" + port);
});
