"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Eye, ThumbsUp, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CommunityPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunityIdeas();
    }, []);

    const fetchCommunityIdeas = async () => {
        try {
            const res = await fetch("/api/ideas/community");
            const data = await res.json();
            if (data.success) {
                setIdeas(data.ideas);
            } else {
                toast.error("데이터 로드 실패");
            }
        } catch (error) {
            toast.error("연결 오류");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Header />

            <main className="container mx-auto pt-32 pb-20 px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-4">
                            <Lightbulb size={14} /> Shared Insights
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">창업가 커뮤니티</h1>
                        <p className="text-white/60 text-lg">
                            전 세계 창업가들이 생성한 혁신적인 아이디어들입니다.
                            영감을 얻고 당신만의 비즈니스를 시작해보세요.
                        </p>
                    </div>
                    <Link href="/#generate">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 gap-2 h-12 px-6 font-bold">
                            내 아이디어 생성하기 <ArrowRight size={18} />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ideas.map((idea, idx) => (
                            <motion.div
                                key={idea.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all group overflow-hidden flex flex-col h-full relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-purple-500/20" />

                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                <Calendar size={12} />
                                                {new Date(idea.createdAt).toLocaleDateString()}
                                            </div>
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-medium">
                                                {idea.authorName}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl text-white group-hover:text-purple-400 transition-colors line-clamp-2 min-h-14">
                                            {idea.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col">
                                        <p className="text-sm text-white/60 line-clamp-3 mb-6 flex-1">
                                            {idea.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-xs text-white/40">
                                                    <Eye size={12} /> {idea.viewCount}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-white/40">
                                                    <ThumbsUp size={12} /> {idea.likeCount}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-purple-400 font-bold">
                                                <MapPin size={12} /> {idea.continent}
                                            </div>
                                        </div>

                                        <Link href={`/result?id=${idea.id}`} className="mt-6">
                                            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-0 text-xs font-bold">
                                                리포트 보기
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
