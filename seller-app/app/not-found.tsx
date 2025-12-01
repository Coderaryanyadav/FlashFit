import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h2 className="text-4xl font-bold mb-4">404</h2>
            <p className="text-gray-400 mb-8">Page not found</p>
            <Link href="/" className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                Dashboard Home
            </Link>
        </div>
    )
}
