import { getUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import { getThreadById } from "@/lib/actions/thread.action";
import Comment from "@/components/forms/Comment";

export default async function ThreadPage({ params }: { params: { id: string } }) {
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await getUser(user?.id);
    if(!userInfo?.onboarded) redirect("/onboarded");

    const thread = await getThreadById(params?.id)

    return (
        <section className="relative">
            <div>
                <ThreadCard 
                    key={thread?._id}
                    id={thread?._id}
                    currentUserId={user?.id || ""}
                    parentId={thread?.parentId}
                    content={thread?.text}
                    author={thread?.author}
                    community={thread?.community}
                    createdAt={thread?.createdAt}
                    comments={thread?.children}
                />
            </div>

            <div className="mt-7">
                <Comment 
                    threadId={thread?.id}
                    currentUserImg={userInfo?.image}
                    currentUserId={JSON.stringify(userInfo?._id)}
                />
            </div>

            <div className="mt-10">
                {
                    thread?.children?.map((childrenItem: any) => (
                        <ThreadCard 
                            key={childrenItem?._id}
                            id={childrenItem?._id}
                            currentUserId={user?.id || ""}
                            parentId={childrenItem?.parentId}
                            content={childrenItem?.text}
                            author={childrenItem?.author}
                            community={childrenItem?.community}
                            createdAt={childrenItem?.createdAt}
                            comments={childrenItem?.children}
                            isComment
                        />
                    ))
                }
            </div>
        </section>
    )
}
