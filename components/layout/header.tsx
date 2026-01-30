"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Header() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">S</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        StartupIdeas.ai
                    </span>
                </Link>
                <nav className="hidden md:flex gap-6">
                    {["About", "Pricing", "Blog", "Contact"].map((item) => (
                        <Link
                            key={item}
                            href="#"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-white",
                                pathname === "/" ? "text-white/60" : "text-white/60"
                            )}
                        >
                            {item}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 hidden sm:flex">
                        Sign In
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                        Get Started
                    </Button>
                </div>
            </div>
        </header>
    );
}
