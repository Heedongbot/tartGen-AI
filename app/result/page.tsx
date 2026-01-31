"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Download, Share2, RefreshCw, Check, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Toaster, toast } from "sonner";
import { createClient } from "@/lib/supabase";

// Type definition for the API response
type GeneratedIdea = {
    title: string;
    description: string;
    whyYou: string[];
    market: {
        size: string;
        growth: string;
        competition: string;
    };
    roadmap: {
        week: string;
        task: string;
    }[];
    products: {
        name: string;
        price: string;
        image: string; // placeholder
        link: string;
    }[];
};

function ResultContent() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get("data");
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<GeneratedIdea | null>(null);
    const [user, setUser] = useState<any>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (!dataParam) return;

        const fetchData = async () => {
            try {
                const userData = JSON.parse(decodeURIComponent(dataParam));
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });

                if (!res.ok) {
                    const errorHtml = await res.text();
                    console.error("API Error Status:", res.status);
                    throw new Error(`Server returned status: ${res.status}`);
                }

                const data = await res.json();

                if (data.error) {
                    throw new Error(data.details || data.error);
                }

                setResult(data);
            } catch (error: any) {
                console.error("Failed to generate idea", error);
                // Show the actual error message from the API
                alert(`오류가 발생했습니다: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // 실시간 세션 감지 추가
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        fetchData();

        return () => {
            subscription.unsubscribe();
        };
    }, [dataParam]);

    const handleShare = async () => {
        // 🔒 보안 강화: 공유 기능도 로그인체크 수행
        const { data: { user: freshUser } } = await supabase.auth.getUser();

        if (!freshUser) {
            toast.error("공유 기능은 로그인 후에 이용 가능합니다.", {
                description: "아이디어 보호를 위해 로그인이 필요합니다.",
                action: {
                    label: "로그인",
                    onClick: () => router.push("/login")
                }
            });
            return;
        }

        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: result?.title || "StartGen AI 아이디어",
                    text: result?.description || "멋진 스타트업 아이디어를 확인해보세요!",
                    url: url
                });
                toast.success("공유창을 열었습니다.");
            } catch (err) {
                console.log("Share canceled", err);
            }
        } else {
            // Fallback for desktop/non-supporting browsers
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                    toast.success("공유 링크가 클립보드에 복사되었습니다!");
                } else {
                    throw new Error("Clipboard API unavailable");
                }
            } catch (err) {
                // Secondary fallback: hidden textarea method
                const textArea = document.createElement("textarea");
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    toast.success("링크가 복사되었습니다! (Fallback)");
                } catch (copyErr) {
                    toast.error("공유 링크를 복사할 수 없습니다. URL을 직접 복사해주세요.");
                }
                document.body.removeChild(textArea);
            }
        }
    };

    const handleDownloadPDF = async () => {
        // 🔒 보안 강화: 세션 상태가 아닌 실시간 서버 체크를 한 번 더 수행
        const { data: { user: freshUser } } = await supabase.auth.getUser();

        if (!freshUser) {
            toast.error("비정상적인 접근입니다. PDF 저장은 로그인 후에만 가능합니다.", {
                description: "유료 기능 서비스 보호를 위해 로그인이 필요합니다.",
                action: {
                    label: "로그인",
                    onClick: () => router.push("/login")
                }
            });
            return;
        }

        if (!contentRef.current) return;

        const loadingToast = toast.loading("PDF 생성 중...");

        try {
            // Add a small delay to ensure fonts are loaded
            await new Promise((resolve) => setTimeout(resolve, 100));

            const dataUrl = await toPng(contentRef.current, {
                cacheBust: true,
                backgroundColor: "#1a0b2e", // Match dark theme bg
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`StartGen-${result?.title || "Idea"}.pdf`);

            toast.dismiss(loadingToast);
            toast.success("PDF가 저장되었습니다!");
        } catch (error) {
            console.error("PDF Fail:", error);
            toast.dismiss(loadingToast);
            toast.error("PDF 생성 실패 (관리자 문의)");
        }
    };

    if (!dataParam) {
        return <div className="text-white text-center py-20">데이터가 없습니다. 홈으로 돌아가주세요.</div>;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
                <h2 className="text-2xl font-bold">AI가 시장을 분석 중입니다...</h2>
                <p className="text-white/60">당신에게 딱 맞는 아이디어를 찾고 있어요.</p>
            </div>
        );
    }

    if (!result) return <div className="text-white text-center">결과를 불러오는데 실패했습니다.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
            <Toaster position="top-center" richColors />

            {/* Upsell Banner for FREE Users */}
            {(() => {
                try {
                    const params = JSON.parse(decodeURIComponent(dataParam || "{}"));
                    if (params.tier === "FREE") {
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative overflow-hidden p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-xl mb-8 group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Zap className="w-24 h-24 text-white" />
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white tracking-widest uppercase">Limited Suggestion</div>
                                        <h3 className="text-2xl font-bold text-white">더 정교한 분석이 필요하신가요? 🚀</h3>
                                        <p className="text-white/60 text-sm max-w-xl">
                                            현재 <b>FREE 요금제</b>로 생성된 기본 아이디어입니다. PRO 플랜으로 업그레이드하고 MBTI, 자본금, 상세 거주지를 반영한 <b>초개인화 창업 로드맵</b>과 <b>실시간 시장 데이터</b>를 확인하세요.
                                        </p>
                                    </div>
                                    <Link href="/pricing" className="shrink-0 w-full md:w-auto">
                                        <Button className="w-full bg-white text-purple-900 hover:bg-white/90 font-bold border-0 shadow-xl shadow-white/10">
                                            PRO 업그레이드 <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    }
                } catch (e) { }
                return null;
            })()}

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                    <div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-purple-500/20 text-purple-200 mb-2">
                            매칭 점수: 94% ⭐
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">{result.title}</h1>
                        <p className="text-xl text-white/80 max-w-2xl">{result.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleShare} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Share2 className="w-4 h-4 mr-2" /> 공유하기
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPDF} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Download className="w-4 h-4 mr-2" /> PDF 저장
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Grid - Wrap with ref for PDF capture */}
            <div ref={contentRef} className="p-4 rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Why You & Market */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">✨ 나에게 맞는 이유 (Why You?)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {result.whyYou.map((reason, idx) => (
                                        <div key={idx} className="flex gap-3 text-white/80">
                                            <div className="min-w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
                                            <p>{reason}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">📊 시장 데이터 (Market Data)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">시장 규모</div>
                                            <div className="text-2xl font-bold text-white">{result.market.size}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">성장성</div>
                                            <div className="text-2xl font-bold text-green-400">{result.market.growth}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">경쟁 강도</div>
                                            <div className="text-2xl font-bold text-yellow-400">{result.market.competition}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle className="text-white">🗺️ 8주 실행 로드맵</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {result.roadmap.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 items-start">
                                                <div className="min-w-[4rem] text-sm font-bold text-purple-400 pt-1">{step.week}</div>
                                                <div className="text-white/80">{step.task}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column: Products */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="bg-white/5 border-white/10 backdrop-blur-lg h-full">
                                <CardHeader>
                                    <CardTitle className="text-white">🛍️ 추천 도구 (Tools)</CardTitle>
                                    <CardDescription className="text-white/50">시작에 필요한 필수 서비스</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {result.products.map((product, idx) => (
                                        <a
                                            key={idx}
                                            href={product.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="w-12 h-12 bg-gray-800 rounded-md flex-shrink-0 border border-white/10 group-hover:border-purple-500/50 transition-colors" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white truncate">{product.name}</div>
                                                <div className="text-sm text-white/50">{product.price}</div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-purple-400" />
                                        </a>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8 pb-20">
                <Link href="/">
                    <Button size="lg" variant="secondary" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> 다시 아이디어 생성하기
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">로딩중...</div>}>
            <ResultContent />
        </Suspense>
    );
}
