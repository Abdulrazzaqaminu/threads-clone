"use server"

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export default async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
        text,
        author,
        community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
        $push: { threads: createdThread._id }
    })

    revalidatePath(path);
  } catch (error: any) {
      throw new Error(`Failed to create thread: ${error.message}`)
  }
}