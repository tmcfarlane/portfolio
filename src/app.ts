import express from "express";
import dotenv from "dotenv";
import OpenAiRouter from "./routes/openai";

// create an express server
const server = express();
server.use(express.json()); // allow express to parse JSON

const port = "3080";

// log incoming requests
server.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'}`);
  console.log("Headers: ", req.headers);
  console.log("Body: ", req.body);
  next();
});

server.use(OpenAiRouter);

// define a route
server.get("/", (req, res) => {
  res.send("Hello World!");
});

// start the server
server.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
