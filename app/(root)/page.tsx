import { getThreads } from "@/lib/actions/thread.action";
import { currentUser } from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";

export default async function Home() {
  const result = await getThreads(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {
          result.threads.length < 1 ?
          (
            <p className="no-result">No threads found</p>
          ): 
          (
            <>
              {
                result.threads.map((thread) => (
                  <ThreadCard 
                    key={thread?._id}
                    id={thread?._id}
                    currentUserId={user?.id || ""}
                    parentId={thread?.parentId}
                    content={thread?.text}
                    author={thread.author}
                    community={thread?.community}
                    createdAt={thread?.createdAt}
                    comments={thread?.children}
                  />
                ))
              }
            </>
          )
        }
      </section>
    </>
  )
}