import * as http from "http";
import express, { Request, Response } from "express";

const port = 28567;

let server: http.Server;

const app = express();

// Setup basic route
app.post("/api/v1/auth/figma-callback", (req: Request, res: Response) => {
  console.log("Figma callback received!", req.body);
  res.send("Hello from the server!");
});

// Graceful shutdown
const shutdown = () => {
  if (server) {
    server.close(() => {
      console.log("Element AI server is shutting down.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle messages from the main process
process.on("message", (message: any) => {
  if (message.cmd === "stop") {
    shutdown();
  }
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server = app.listen(port, () => {
  console.log(`Element AI server is running on port ${port}`);
});
