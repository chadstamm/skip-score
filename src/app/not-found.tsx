import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <Logo className="mb-8" variant="white" />
            <h1 className="text-6xl font-black text-white mb-3">404</h1>
            <p className="text-xl font-semibold text-white/70 mb-8">
                Page not found
            </p>
            <p className="text-sm text-white/50 mb-10 max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="px-6 py-3 rounded-xl font-bold bg-skip-coral text-white hover:bg-orange-600 transition-all shadow-lg"
                >
                    Go Home
                </Link>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
                >
                    Dashboard
                </Link>
            </div>
        </main>
    );
}
