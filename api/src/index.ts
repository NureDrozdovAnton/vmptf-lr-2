import "./env";
import db from "./data-source";
import * as redis from "./redis-client";
import app from "./app";
import { setupFixtures } from "./fixtures";

const PORT = process.env.PORT || 8086;

const connect = async (name: string, fn: () => Promise<unknown>) => {
    try {
        await fn();
    } catch (error) {
        console.error(`${name}: failed to connect`);
        throw error;
    }

    console.log(`${name}: connected`);
};

const start = async () => {
    try {
        await connect("postgres", db.initialize.bind(db));
        await connect("redis", redis.connect);

        await setupFixtures();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server with reason:");
        console.error(error);
        process.exit(1);
    }
};

start();
