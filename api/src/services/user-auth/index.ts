import crypto from "crypto";
import db from "~/data-source";
import { User } from "~/entities";
import type { SignInParams, SignUpParams } from "./interfaces";

const userRepository = db.getRepository(User);

const getPasswordHash = (password: string, salt: string) =>
    new Promise<string>((resolve, reject) => {
        crypto.pbkdf2(
            password,
            salt,
            1000,
            64,
            "sha512",
            (error, derivedKey) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(derivedKey.toString("hex"));
                }
            }
        );
    });

export const signUp = async ({ email, password, name }: SignUpParams) => {
    if (!email || !password || !name) {
        throw new Error("Email and password are required");
    }

    const existingUser = await userRepository.findOneBy({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await getPasswordHash(password, salt);

    const user = userRepository.create({
        email,
        name,
        password: hashedPassword,
        salt,
    });

    await userRepository.save(user);

    return user;
};

export const signIn = async ({ email, password }: SignInParams) => {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
        throw new Error("Email or password is incorrect");
    }

    const hashedPassword = await getPasswordHash(password, user.salt);
    const equal = crypto.timingSafeEqual(
        Buffer.from(hashedPassword),
        Buffer.from(user.password)
    );

    if (!equal) {
        throw new Error("Email or password is incorrect");
    }

    return user;
};
