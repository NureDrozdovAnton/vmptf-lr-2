import { Request } from "express";
import z from "zod";

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type SignInRequest = Request<
    unknown,
    unknown,
    z.infer<typeof SignInSchema>
>;

export const SignUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
});

export type SignUpRequest = Request<
    unknown,
    unknown,
    z.infer<typeof SignUpSchema>
>;
