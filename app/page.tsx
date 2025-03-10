import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SEPM Project</h1>
        <p className="mb-8 text-lg">AI-Driven Research Paper Summarizer</p>
        <Link 
          href="/signin" 
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}