import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mx-auto mb-8 block w-fit font-serif text-3xl font-bold italic text-brand"
      >
        Orderly
      </Link>
      {children}
    </div>
  );
}
