import bodyParser from "body-parser";
import config from "config";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import createError from "http-errors";
import pg from "pg";
const { Pool } = pg;

import type {
  Express,
  NextFunction,
  Request,
  Response,
} from "express";

dotenv.config();

const app: Express = express();

const PORT = config.get<string>("SERVICE_PORT") || 3000;

// Create a MySQL connection pool
const pool = new Pool({
  user: "woo-backend",
  host: "localhost", 
  database: "integration-test",
  password: "woo-backend", 
  port: 5432,
});

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
    res.status(500).json({ error: error });
  }
});

app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

app.listen(PORT, () => console.log(`Running on ${PORT}`));
