"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utility from shadcn/ui for className merging
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Profile", path: "/profile" },
    { name: "Upload", path: "/upload" }, // Assuming Dashboard is the upload page
    { name: "Summaries", path: "/summaries" },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="bg-white text-black p-4 shadow-md fixed w-full z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <Link href={'/'} className="text-xl font-bold">SEPM Project</Link>

        {/* Navigation Links */}
        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Button
                variant="link"
                className={cn(
                  "text-black hover:text-gray-700 p-0",
                  "transition-colors duration-200"
                )}
                onClick={() => handleNavClick(item.path)}
              >
                {item.name}
              </Button>
            </li>
          ))}
        </ul>

        {/* Auth Controls */}
        <div>
          {status === "loading" ? (
            <span className="text-gray-400">Loading...</span>
          ) : session ? (
            <Button
              variant="outline"
              className="text-black border-black hover:bg-red-400"
              onClick={() => signOut({ callbackUrl: "/signin" })}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-black border-black hover:bg-gray-300"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}