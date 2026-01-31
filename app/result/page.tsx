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
    const [result, setResult] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
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

        if (!pdfRef.current) return;

        const loadingToast = toast.loading("프리미엄 리포트 생성 중...");

        try {
            // Add a small delay to ensure fonts and styles are settled
            await new Promise((resolve) => setTimeout(resolve, 500));

            const dataUrl = await toPng(pdfRef.current, {
                cacheBust: true,
                backgroundColor: "#ffffff", // Professional white background for PDF
                pixelRatio: 2, // High resolution
                quality: 1.0,
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Handle multi-page if height exceeds A4 (simplified for now as a long image)
            // For a really premium feel, we should split it, but capturing as one long high-res image is often better for simple reports.
            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`StartGen_Premium_Report_${result?.title || "Idea"}.pdf`);

            toast.dismiss(loadingToast);
            toast.success("프리미엄 PDF 리포트가 저장되었습니다!");
        } catch (error) {
            console.error("PDF Fail:", error);
            toast.dismiss(loadingToast);
            toast.error("리포트 생성 실패 (관리자 문의)");
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
                                    {result.whyYou.map((reason: string, idx: number) => (
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
                                        {result.roadmap.map((step: { week: string, task: string }, idx: number) => (
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
                                    {result.products.map((product: any, idx: number) => (
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
            {/* Hidden Premium PDF Template - Rendered only for capture */}
            <div className="fixed -left-[9999px] -top-[9999px]">
                <div
                    ref={pdfRef}
                    className="w-[800px] bg-white p-16 text-slate-900 font-sans leading-relaxed"
                >
                    {/* Header Branding */}
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-8 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-900 text-white p-2 rounded-lg font-bold text-xl">S</div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">StartGen AI</h2>
                                <p className="text-[10px] text-slate-500 font-medium">Strategic Startup Idea Generator</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidential Report</p>
                            <p className="text-xs font-medium">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Cover Section */}
                    <div className="mb-16">
                        <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold mb-4 uppercase tracking-widest">Premium Strategy</div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight mb-6">
                            {result.title}
                        </h1>
                        <p className="text-2xl text-slate-600 font-medium leading-relaxed border-l-4 border-slate-200 pl-6 py-2">
                            {result.description}
                        </p>
                    </div>

                    {/* Why You Section */}
                    <div className="mb-12">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Analysis: Why this fits you</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {result.whyYou.map((reason: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                                    <p className="text-lg font-medium text-slate-700 leading-snug pt-1">{reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Data Section */}
                    <div className="mb-12">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Market Environment</h3>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="border-t-4 border-slate-900 pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Market Size</p>
                                <p className="text-3xl font-black text-slate-900">{result.market.size}</p>
                            </div>
                            <div className="border-t-4 border-green-500 pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Growth Score</p>
                                <p className="text-3xl font-black text-green-600">{result.market.growth}</p>
                            </div>
                            <div className="border-t-4 border-yellow-500 pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Competition</p>
                                <p className="text-3xl font-black text-slate-900">{result.market.competition}</p>
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Section */}
                    <div className="mb-16">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">8-Week Execution Roadmap</h3>
                        <div className="space-y-4">
                            {result.roadmap.map((step: any, idx: number) => (
                                <div key={idx} className="flex gap-6 items-start border-b border-slate-50 pb-4">
                                    <div className="w-16 font-black text-purple-600 text-sm whitespace-nowrap">{step.week}</div>
                                    <div className="text-lg font-medium text-slate-800">{step.task}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Disclaimer */}
                    <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-medium px-20">
                            본 리포트는 StartGen AI의 인공지능 분석 알고리즘을 통해 생성되었습니다. 제공되는 데이터는 시장 상황에 따라 변동될 수 있으며, 투자 및 사업 실행의 최종 결정 책임은 본인에게 있습니다.
                        </p>
                        <p className="text-[9px] text-slate-300 mt-4 tracking-widest uppercase">© 2026 STARTGEN AI GROUP ALL RIGHTS RESERVED - WWW.STARTGEN.AI</p>
                    </div>
                </div>
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
