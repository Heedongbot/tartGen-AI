"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // 💾 아이디 저장 불러오기 (마운트 시)
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("회원가입 성공! 로그인해주세요.");
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // 💾 아이디 저장 체크 시 로컬 스토리지 저장
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                toast.success("로그인 성공!");
                router.push("/");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 flex-col gap-4">
            {/* 🚨 환경 변수 진단 경고창 */}
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL ||
                process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
                !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200"
                    >
                        <div className="flex items-center gap-2 mb-2 font-bold text-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            설정 오류 감지됨
                        </div>
                        <p className="text-sm mb-3">
                            Supabase 환경 변수가 Vercel에 설정되지 않았습니다.<br />
                            로그인이 작동하지 않습니다.
                        </p>
                        <div className="bg-black/30 p-2 rounded text-xs font-mono mb-2">
                            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "설정됨" : "누락됨"}<br />
                            KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "설정됨" : "누락됨"}
                        </div>
                        <p className="text-xs text-white/50">
                            Vercel Settings {'>'} Environment Variables 메뉴에서<br />
                            NEXT_PUBLIC_SUPABASE_URL 및 ANON_KEY를 추가하고 Redeploy 하세요.
                        </p>
                    </motion.div>
                )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-white">
                            {isSignUp ? "회원가입" : "StartGen AI 로그인"}
                        </CardTitle>
                        <CardDescription className="text-center text-white/60">
                            이메일로 간편하게 시작하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                                    <Input
                                        type="email"
                                        placeholder="이메일"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                                    <Input
                                        type="password"
                                        placeholder="비밀번호"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* 💾 아이디 저장 체크박스 */}
                            {!isSignUp && (
                                <div className="flex items-center space-x-2 pb-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium text-white/60 cursor-pointer hover:text-white/80 transition-colors"
                                    >
                                        아이디 저장
                                    </label>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-11"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? "가입하기" : "로그인"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            <span className="text-white/60">
                                {isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
                            </span>{" "}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-purple-400 hover:text-purple-300 font-semibold underline-offset-4 hover:underline"
                            >
                                {isSignUp ? "로그인하기" : "회원가입하기"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
