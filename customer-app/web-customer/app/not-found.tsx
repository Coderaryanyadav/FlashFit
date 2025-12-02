import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <Header />
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <h1 className="text-[150px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-black/20 select-none">
                    404
                </h1>
                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Maybe check out our latest drops instead?
                </p>
                <Link href="/">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 h-12 rounded-full">
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
