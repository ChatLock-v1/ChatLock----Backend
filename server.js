import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotEnv from "dotenv";
import { router } from "./routes/userRoutes.js";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import { setupSocket } from "./sockets/socketManager.js";
import { connectDB } from "./config/db.js";
dotEnv.config();


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors()); // optional, depending on your use

// Routes
app.use('/', router);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Adjust this in production
  },
});


setupSocket(io)

// Start server
connectDB()
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
