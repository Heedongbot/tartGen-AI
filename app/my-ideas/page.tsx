"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, ExternalLink, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function MyIdeasPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        try {
            const res = await fetch("/api/ideas/personal");
            const data = await res.json();
            if (data.success) {
                setIdeas(data.ideas);
            } else {
                toast.error(data.error || "아이디어를 불러오는데 실패했습니다.");
            }
        } catch (error) {
            toast.error("연결 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (id: string) => {
        try {
            const res = await fetch(`/api/ideas/${id}/publish`, { method: "PATCH" });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setIdeas(ideas.map(idea => idea.id === id ? { ...idea, isPublic: !idea.isPublic } : idea));
            }
        } catch (error) {
            toast.error("변경 실패");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Header />

            <main className="container mx-auto pt-32 pb-20 px-4 md:px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">내 아이디어 보관함</h1>
                    <p className="text-white/60">지금까지 생성한 모든 비즈니스 인사이트를 한눈에 확인하세요.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                        <p className="text-white/40">데이터를 불러오는 중...</p>
                    </div>
                ) : ideas.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
                        <div className="mb-6 flex justify-center text-white/20">
                            <Share2 size={64} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">저장된 아이디어가 없습니다.</h3>
                        <p className="text-white/40 mb-8 max-w-md mx-auto">
                            새로운 창업 아이디어를 생성하고 보관함에 저장해 보세요!
                        </p>
                        <Link href="/#generate">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                아이디어 생성하러 가기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {ideas.map((idea, idx) => (
                                <motion.div
                                    key={idea.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    layout
                                >
                                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-white/20 transition-all group h-full flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                    <Calendar size={12} />
                                                    {new Date(idea.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${idea.isPublic ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/40 border border-white/20'}`}>
                                                    {idea.isPublic ? "공개됨" : "비공개"}
                                                </div>
                                            </div>
                                            <CardTitle className="text-white line-clamp-2 leading-tight">
                                                {idea.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col">
                                            <p className="text-sm text-white/60 line-clamp-3 mb-6 flex-1">
                                                {idea.description}
                                            </p>

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="flex items-center gap-1.5 text-xs text-white/40">
                                                    <MapPin size={12} />
                                                    {idea.continent || "Global"}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href={`/result?id=${idea.id}`} className="w-full">
                                                    <Button variant="secondary" size="sm" className="w-full gap-2">
                                                        <ExternalLink size={14} /> 상세보기
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => togglePublish(idea.id)}
                                                    className={idea.isPublic ? "border-green-500/30 text-green-400" : "border-white/10"}
                                                >
                                                    {idea.isPublic ? "숨기기" : "공개하기"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
