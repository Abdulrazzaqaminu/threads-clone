import { getUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import PostThreads from "@/components/forms/PostThreads";

export default async function CreateThread() {
  const user = await currentUser();

  if(!user) return null;
  
  const userInfo = await getUser(user?.id);

  if(!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create Threads</h1>

      <PostThreads userId={userInfo?._id} />
    </>
  )
}
