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

interface Props {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}

export async function createThread({ text, author, communityId, path }: Params) {
  connectToDB();

  try {
    const createdThread = await Thread.create({
        text,
        author,
        community: null,
    });

    await User.findByIdAndUpdate(author, {
        $push: { threads: createdThread._id }
    })

    revalidatePath(path);
  } catch (error: any) {
      throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function getThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();

  try {
    const skipAmount = (pageNumber - 1) * pageSize;
  
    const threadsQuery = Thread.find({parentId: { $in: [ null, undefined] }})
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({ 
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image"
        }  
      });
  
    const totalThreadsCount = await Thread.countDocuments({parentId: { $in: [ null, undefined] }});
  
    const threads = await threadsQuery.exec();
  
    const isNext = totalThreadsCount > skipAmount + threads.length;
  
    return { threads, isNext };
  } catch (error: any) {
    throw new Error(`Failed to get threads: ${error.message}`);
  }
}

export async function getThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image"
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image"
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

      return thread;
  } catch (error: any) {
    throw new Error(`Failed to get thread: ${error.message}`);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path
}: Props) {
  connectToDB();

  try {
    const originalThread = await Thread.findById(threadId);

    if(!originalThread) {
      throw new Error("Thread not found");
    }

    const threadComment = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    });

    const savedThreadComment = await threadComment.save();

    originalThread.children.push(savedThreadComment._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
}