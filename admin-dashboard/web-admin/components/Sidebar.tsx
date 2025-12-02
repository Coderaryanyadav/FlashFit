"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Truck,
  Settings,
  LogOut,
  Package,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    href: "/orders",
    color: "text-violet-500",
  },
  {
    label: "Products",
    icon: Package,
    href: "/products",
    color: "text-pink-700",
  },
  {
    label: "Drivers",
    icon: Truck,
    href: "/drivers",
    color: "text-orange-700",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
    color: "text-emerald-500",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-green-700",
  },
  {
    label: "Reviews",
    icon: MessageSquare,
    href: "/reviews",
    color: "text-yellow-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="space-y-4 py-6 flex flex-col h-full bg-black text-white border-r border-zinc-800">
      <div className="px-4 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-12">
          <div className="relative w-10 h-10 mr-3">
            <div className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            FlashFit <span className="text-xs font-normal text-gray-500 ml-1">Admin</span>
          </h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                pathname === route.href
                  ? "text-white bg-zinc-800 border border-zinc-700 shadow-sm"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-white" : route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-4 py-2">
        {/* User profile moved to Header */}
      </div>
    </div>
  );
}
