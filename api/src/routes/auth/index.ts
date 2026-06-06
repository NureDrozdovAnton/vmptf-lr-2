import type { BaseResponse } from "~/interfaces";
import { Router } from "express";
import { UserAuth } from "~/services";
import {
    SignInSchema,
    SignInRequest,
    SignUpSchema,
    SignUpRequest,
} from "./schema";
import db from "~/data-source";
import { User } from "~/entities";

const userRepo = db.getRepository(User);

const router = Router();

router.get("/me", async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.json({
            ok: true,
            user: null,
        });
    }

    try {
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            return res.json({
                ok: true,
                user: null,
            });
        }

        res.json({
            ok: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: "Failed to fetch user info",
        });
    }
});

router.post("/sign-up", async (req: SignUpRequest, res: BaseResponse) => {
    const validation = SignUpSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json({
            ok: false,
            error: validation.error,
        });

        return;
    }

    try {
        const user = await UserAuth.signUp({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
        });

        req.session.userId = user.id;

        res.json({
            ok: true,
            data: null,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error";

        res.status(409).json({
            ok: false,
            error: message,
        });
    }
});

router.post("/sign-in", async (req: SignInRequest, res: BaseResponse) => {
    const validation = SignInSchema.safeParse(req.body);

    if (!validation.success) {
        res.status(400).json({
            ok: false,
            error: validation.error,
        });

        return;
    }

    try {
        const user = await UserAuth.signIn({
            email: req.body.email,
            password: req.body.password,
        });

        req.session.userId = user.id;

        res.json({
            ok: true,
            data: null,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error";

        res.status(401).json({
            ok: false,
            error: message,
        });
    }
});

router.post("/sign-out", async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);

            res.json({
                ok: false,
                error: "Unknown error",
            });
        } else {
            res.json({
                ok: true,
                data: null,
            });
        }
    });
});

export default router;
