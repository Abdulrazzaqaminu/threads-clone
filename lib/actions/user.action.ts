"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function searchUser({
    userId,
    pageNumber = 1,
    pageSize = 20,
    searchString = "",
    sortBy = "desc"
}: {
    userId: string;
    pageNumber?: number;
    pageSize?: number
    searchString?: string;
    sortBy?: SortOrder
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if(searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex }},
                { name: { $regex: regex }},
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const userQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUserCount = await User.countDocuments(query)

        const users = await userQuery.exec();

        const isNext = totalUserCount > skipAmount + users.length

        return { users, isNext }
    } catch (error: any) {
        throw new Error(`Failed to get users: ${error.message}`)
    }
}

export async function activities(userId: string) {
    try {
        connectToDB();

        const userThreads = await Thread.find({ author: userId });

        const childThreadsIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        const replies = await Thread.find({
            _id: { $in: childThreadsIds },
            author: { $ne: userId }
        }).populate({
            path: "author",
            model: User,
            select: "name image _id"
        });

        return replies;
    } catch (error) {
        throw new Error(`Failed to get replies`);
    }
}