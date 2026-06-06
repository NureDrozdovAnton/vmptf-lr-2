import { RedisStore } from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { AuthMiddleware } from "./middlewares";
import * as redis from "./redis-client";
import { AuthRouter, CoursesRouter, ReviewsRouter } from "./routes";

const app = express();

app.use(morgan("common"));
app.use(express.json());
app.use(
    cors({
        origin: [process.env.APP_WEB_URL ?? "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);
app.use(
    session({
        secret: process.env.SESSION_SECRET ?? "default",
        store: new RedisStore({ client: redis.client, prefix: "session:" }),
        cookie: {
            httpOnly: true,
        },
        resave: false,
        saveUninitialized: true,
    })
);

app.use(AuthMiddleware);

app.use("/auth", AuthRouter);
app.use("/courses", CoursesRouter);
app.use("/reviews", ReviewsRouter);

export default app;
