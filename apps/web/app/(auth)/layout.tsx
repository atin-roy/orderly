import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-serif italic text-3xl font-bold text-brand mb-8">
        Orderly
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
}
