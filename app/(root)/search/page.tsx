import { getUser, searchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/common/Searchbar";

export default async function SearchPage({ searchParams }: { searchParams: {[key: string]: string | undefined} }) {
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await getUser(user?.id);
    if(!userInfo?.onboarded) redirect("/onboarding");

    const result = await searchUser({
        userId: user?.id,
        searchString: searchParams.q,
        pageNumber: searchParams?.page ? +searchParams.page : 1,
        pageSize: 25
    });

    return (
        <section>
            <h1 className="head-text mb-10">Search</h1>

            <Searchbar routeType='search' />

            <div className="mt-14 flex flex-col gap-9">
                {
                    result?.users?.length === 0
                    ? (
                        <p className="no-result">No Result</p>
                    )
                    : (
                        <>
                            {
                                result?.users?.map((user) => (
                                    <UserCard 
                                        key={user?.id}
                                        id={user?.id}
                                        name={user?.name}
                                        username={user?.username}
                                        imgUrl={user?.image}
                                        personType="User"
                                    />
                                ))
                            }
                        </>
                    )
                }
            </div>
        </section>
    )
}
