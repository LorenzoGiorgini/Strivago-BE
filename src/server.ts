import express, { Router } from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import AccRouter from "./routes/accomodations";
import DesRouter from "./routes/destinations";
import UserRouter from "./routes/users";

process.env.TS_NODE_DEV && require("dotenv").config();

const server = express();

server.use(cors());
server.use(express.json());
server.use("/accommodation", AccRouter);
server.use("/destinations", DesRouter);
server.use("/users", UserRouter)

console.table(listEndpoints(server));

export default server;