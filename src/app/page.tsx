import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  const handleSignIn = async () => {
    "use server";
    await signIn("Credentials", {
      redirectTo: "/all-tasks",
    });
  };
  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="w-2/3 break-words">
        session: {JSON.stringify(session?.user)}
      </div>
      <form className="mt-3 w-1/3 flex justify-around">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          formAction={handleSignIn}
        >
          ログイン
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          formAction={handleSignOut}
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
