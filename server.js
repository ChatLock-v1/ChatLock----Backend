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
import rateLimit from "express-rate-limit";
dotEnv.config();


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
})); // optional, depending on your use

// Routes


//rateLimit

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use(limiter)
 
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
