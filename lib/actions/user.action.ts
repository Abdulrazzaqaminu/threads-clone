"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function UpdateUser(
   {
        userId,
        username,
        name,
        bio,
        image,
        path
    }: Params
): Promise<void> {
    try {
        connectToDB();
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            { upsert: true }
        );
    
        if(path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
}

export async function getUser(userId: string) {
    try {
        connectToDB();
        return await User
            .findOne({id: userId})
            // .populate({
            //     path: "communities",
            //     model: "Community"
            // });
    } catch (error: any) {
        throw new Error(`Failed to get user: ${error.message}`)
    }
}

export async function getUserThreads(userId: string) {
    try {
        connectToDB();
        const threads = await User.findOne({id: userId})
            .populate({
                path: "threads",
                model: Thread,
                populate: {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id"
                    }
                }
            });
        return threads;
    } catch (error: any) {
        throw new Error(`Failed to get user threads: ${error.message}`)
    }
}