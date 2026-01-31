"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("로그아웃 되었습니다.");
        router.refresh();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">S</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        StartGen AI
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
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-white/60 hidden sm:inline-block">
                                {user.email?.split("@")[0]}님
                            </span>
                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="text-white hover:text-white hover:bg-white/10"
                            >
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 hidden sm:flex">
                                로그인
                            </Button>
                        </Link>
                    )}
                    <Link href="/#generate">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                            아이디어 생성
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
