"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // In a real app, check if user has 'seller' role
      router.push("/");
    } catch (error: any) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Secure access only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Admin Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter the email"
              className="bg-neutral-800 border-white/10 text-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter the password"
              className="bg-neutral-800 border-white/10 text-white h-12"
            />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg transition-all hover:scale-[1.02]" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Access Dashboard"}
          </Button>
        </form>
      </div>

      <div className="mt-6 text-center absolute bottom-8">
        <p className="text-gray-400 text-sm">
          New Seller?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Create an account
          </Link>
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-white font-bold text-lg">Verifying Credentials...</p>
          </div>
        </div>
      )}
    </div>
  );
}
