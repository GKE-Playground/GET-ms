import bodyParser from "body-parser";
import config from "config";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import createError from "http-errors";
import pg from "pg";
import winston from "winston";
const { Pool } = pg;

import type {
  Express,
  NextFunction,
  Request,
  Response,
} from "express";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [ new winston.transports.Console() ],
});

dotenv.config();

const app: Express = express();

logger.info("Environment Configurations:", process.env);

const PORT = config.get<string>("SERVICE_PORT") || 3000;

const DB_USER = config.get<string>("DB_USER");
const DB_HOST = config.get<string>("DB_HOST");
const DB_NAME = config.get<string>("DB_NAME");
const DB_PASSWORD = config.get<string>("DB_PASS");
const DB_PORT = config.get<number>("DB_PORT");

const pool = new Pool({
  user: process.env["DB_USER"],
  host: process.env["DB_HOST"],
  database: process.env["DB_NAME"],
  password: process.env["DB_PASS"],
  port: Number(process.env["DB_PORT"]),
});

logger.info("Database Pool Configuration:", pool);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("GET ms");
});

app.get("/getData", async (_req: Request, res: Response) => {
  try {
    // Run the select query using the pool
    const queryResult = await pool.query("SELECT * FROM todos");

    // Send the query results as JSON
    res.json(queryResult.rows);
  } catch (error) {
    console.error("Error running query", error);
    res.status(500).json({
      error: error,
      env: {
        DB_USER: DB_USER,
        DB_HOST: DB_HOST,
        DB_NAME: DB_NAME,
        DB_PASSWORD: DB_PASSWORD,
        DB_PORT: DB_PORT,
      },
    });
  }
});

app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
