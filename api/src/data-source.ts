import { DataSource } from "typeorm";
import * as entities from "./entities";
import path from "path";

const host = process.env.POSTGRES_HOST || "localhost";
const port = process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT)
    : 5432;
const username = process.env.POSTGRES_USER || "postgres";
const password = process.env.POSTGRES_PASSWORD || "password";
const database = process.env.POSTGRES_DB || "vmptf";

const db = new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database,
    synchronize: false,
    logging: false,
    entities: [...Object.values(entities)],
    migrations: [path.resolve(__dirname, "migrations/*")],
});

export default db;
