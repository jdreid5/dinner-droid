import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				<Link href="/recipes">
					<button className="bg-blue-500 text-white px-4 py-2 rounded-md">Search and View Recipes</button>
				</Link>
				<Link href="/plan">
					<button className="bg-blue-500 text-white px-4 py-2 rounded-md">Make a Plan</button>
				</Link>
			</main>
		</div>
	);
}
