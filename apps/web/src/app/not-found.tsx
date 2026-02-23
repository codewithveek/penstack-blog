import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-gray-500">This page could not be found.</p>
      <Link href="/" className="text-indigo-600 hover:underline text-sm">
        ← Back to home
      </Link>
    </div>
  );
}
