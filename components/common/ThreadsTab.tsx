import { getUserThreads } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

export default async function ThreadsTab({
    currentUserId,
    accountId,
    accountType
}: Props) {
    let result = await getUserThreads(accountId);
    if(!result) redirect("/");

    return (
        <section className="mt-9 flex flex-col gap-10">
            {
                result?.threads?.map((thread: any) => (
                    <ThreadCard 
                        key={thread?._id}
                        id={thread?._id}
                        currentUserId={currentUserId}
                        parentId={thread?.parentId}
                        content={thread?.text}
                        author={
                            accountType === "User"
                            ? {name: result?.name, image: result?.image, id: result?.id}
                            : {name: thread?.author?.name, image: thread?.author?.image, id: thread?.author?.id}
                        }
                        community={thread?.community}
                        createdAt={thread?.createdAt}
                        comments={thread?.children}
                    />
                ))
            }
        </section>
    )
}
