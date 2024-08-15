import express from "express";
import pkg from "body-parser";
import routes from "./routes.js";
import cors from "cors";

const app = express();

const { json, urlencoded } = pkg;
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/api", routes);

export default app;
