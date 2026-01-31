"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Check, ArrowRight, Loader2, RefreshCw, Zap, TrendingUp } from "lucide-react";
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
    const idParam = searchParams.get("id"); // Get ID from URL
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // 실시간 세션 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        const loadData = async () => {
            setLoading(true);
            try {
                if (idParam) {
                    // ID가 있으면 DB에서 직접 조회
                    const res = await fetch(`/api/ideas/${idParam}`);
                    const data = await res.json();
                    if (data.success) {
                        setResult(data);
                    } else {
                        throw new Error(data.error);
                    }
                } else if (dataParam) {
                    // 데이터 파라미터가 있으면 새로 생성
                    const userData = JSON.parse(decodeURIComponent(dataParam));
                    const res = await fetch("/api/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(userData),
                    });

                    if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
                    const data = await res.json();
                    if (data.error) throw new Error(data.details || data.error);

                    setResult(data);
                    // 새로 생성된 경우 ID가 있으면 URL 업데이트 (Optional but good for sharing)
                    if (data.id) {
                        window.history.replaceState(null, "", `/result?id=${data.id}`);
                    }
                }
            } catch (error: any) {
                console.error("Failed to load idea", error);
                alert(`오류가 발생했습니다: ${error.message}`);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        loadData();

        return () => {
            subscription.unsubscribe();
        };
    }, [dataParam, idParam]);

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

    const handleManualSave = async () => {
        if (!dataParam) return;

        const loadingToast = toast.loading("아이디어 저장 중...");
        try {
            const inputs = JSON.parse(decodeURIComponent(dataParam));
            const payload = {
                ...inputs,          // Original inputs (location, budget, etc.)
                ...result,          // Generated content (title, description, etc.)
                market: undefined,  // Cleanup if needed, but API expects 'market' mapped to 'marketData'
                marketData: result.market // Map frontend 'market' to API expected 'market' (or API handles it)
            };

            const res = await fetch("/api/ideas/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.dismiss(loadingToast);
                toast.success("아이디어가 성공적으로 저장되었습니다!");
                setResult(prev => ({ ...prev, id: data.id, userId: user?.id }));

                // Update URL to 'id' mode to persist state
                window.history.replaceState(null, "", `/result?id=${data.id}`);
            } else {
                throw new Error(data.error || "저장 실패");
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            console.error(error);
            toast.error(`저장 실패: ${error.message}`);
        }
    };

    const handlePublish = async () => {
        if (!result?.id) return;

        try {
            const res = await fetch(`/api/ideas/${result.id}/publish`, { method: "PATCH" });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setResult({ ...result, isPublic: data.isPublic });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("변경 중 오류가 발생했습니다.");
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
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // 📄 Query all page elements (Tagged with .pdf-page)
            const pages = pdfRef.current.querySelectorAll(".pdf-page");

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await toPng(page, {
                    cacheBust: true,
                    backgroundColor: "#ffffff",
                    pixelRatio: 2,
                    quality: 1.0,
                });

                if (i > 0) pdf.addPage();

                // 고정된 A4 크기(1132px)로 관리되므로 잘림 없이 1:1 매칭
                pdf.addImage(canvas, "PNG", 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`StartGen_Premium_Report_${result?.title || "Idea"}.pdf`);

            toast.dismiss(loadingToast);
            toast.success("프리미엄 PDF 리포트가 저장되었습니다!");
        } catch (error) {
            console.error("PDF Fail:", error);
            toast.dismiss(loadingToast);
            toast.error("리포트 생성 실패 (관리자 문의)");
        }
    };

    if (!dataParam && !idParam) {
        return <div className="text-white text-center py-20">잘못된 접근입니다. 홈으로 돌아가주세요.</div>;
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
                    <div className="flex flex-wrap gap-2">
                        {/* 💾 Manual Save Button (Show only if not saved yet) */}
                        {!result.id && (
                            <Button
                                onClick={handleManualSave}
                                className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg shadow-purple-500/20"
                            >
                                <Check className="w-4 h-4 mr-2" /> 아이디어 저장
                            </Button>
                        )}

                        {/* 📢 Publish Button (Show only if saved and owned) */}
                        {result.id && user?.id === (result.userId || user.id) && (
                            <Button
                                variant="outline"
                                onClick={handlePublish}
                                className={result.isPublic ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                {result.isPublic ? "공개 취소" : "커뮤니티 공개"}
                            </Button>
                        )}

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
                                    <CardTitle className="text-white">📊 시장 분석 (Market Intelligence)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">시장 규모</div>
                                            <div className="text-xl font-bold text-white">{result.market.size}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">성장성</div>
                                            <div className="text-xl font-bold text-green-400">{result.market.growth}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <div className="text-sm text-white/50 mb-1">경쟁 강도</div>
                                            <div className="text-xl font-bold text-yellow-400">{result.market.competition}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <div>
                                            <h4 className="text-purple-400 font-bold mb-1 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" /> 시장의 방향성
                                            </h4>
                                            <p className="text-white/70 text-sm leading-relaxed">{result.market.direction}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-pink-400 font-bold mb-1 flex items-center gap-2">
                                                <Zap className="w-4 h-4" /> 핵심 가치 제안
                                            </h4>
                                            <p className="text-white/70 text-sm leading-relaxed">{result.market.value}</p>
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
                    className="w-[800px] bg-white text-slate-900 font-sans leading-relaxed flex flex-col"
                >
                    {/* PAGE 1: COVER & EXECUTIVE SUMMARY */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col border-b-[20px] border-slate-900 bg-white overflow-hidden">
                        {/* Header Branding */}
                        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-8 mb-24">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-900 text-white p-2 rounded-lg font-bold text-2xl">S</div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">StartGen AI</h2>
                                    <p className="text-[11px] text-slate-500 font-bold tracking-[0.3em] uppercase">Confidential Strategy Report</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1">Issue Series: 2026-X</p>
                                <p className="text-sm font-bold">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="flex-1 flex flex-col justify-center mb-20 px-4">
                            <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-sm text-xs font-black mb-8 uppercase tracking-[0.4em] self-start">Premium Analysis</div>
                            <h1 className="text-5xl font-black text-slate-900 leading-[1.2] mb-12 tracking-tighter">
                                {result.title}
                            </h1>
                            <div className="h-2 w-48 bg-purple-600 mb-12" />
                            <p className="text-lg text-slate-600 font-medium leading-[1.8] max-w-2xl italic">
                                "{result.description}"
                            </p>
                        </div>

                        {/* Why You Summary */}
                        <div className="grid grid-cols-2 gap-12 mt-auto pt-16 border-t border-slate-100">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Fit</h4>
                                <ul className="space-y-3">
                                    {result.whyYou.slice(0, 3).map((reason: string, idx: number) => (
                                        <li key={idx} className="flex gap-3 text-sm font-bold text-slate-700">
                                            <span className="text-purple-600">▪</span> {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col justify-end text-right">
                                <p className="text-[10px] text-slate-300 font-medium mb-1 italic">Generated by Alpha-Mind Engine v2.0</p>
                                <p className="text-[10px] text-slate-900 font-bold uppercase tracking-widest leading-loose border-t border-slate-900 pt-2 inline-block ml-auto">CONFIDENTIAL FOR: PRO MEMBER</p>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2: MARKET INTELLIGENCE (Part 1 - Metrics) */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col bg-slate-50 overflow-hidden">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-16">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">02 Market Intelligence</h2>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Section Analytics</p>
                        </div>
                        {/* Market Overview Grid */}
                        <div className="grid grid-cols-3 gap-8 mb-16">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-slate-900">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Size</p>
                                <p className="text-4xl font-black text-slate-900">{result.market.size}</p>
                                <div className="mt-4 text-[11px] font-bold text-slate-400">Estimated Global Value</div>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-500">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Growth Index</p>
                                <p className="text-4xl font-black text-green-600">{result.market.growth}</p>
                                <div className="mt-4 text-[11px] font-bold text-slate-400">Year-over-Year Projection</div>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-yellow-500">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Competition</p>
                                <p className="text-4xl font-black text-slate-900">{result.market.competition}</p>
                                <div className="mt-4 text-[11px] font-bold text-slate-400">Relative Competitive Pressure</div>
                            </div>
                        </div>

                        {/* Deep Analysis Panel 1 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm relative overflow-hidden flex-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-purple-600" />
                                시장 동향 및 방향성 (Market Direction)
                            </h3>
                            <p className="text-base text-slate-600 leading-[1.7] font-medium italic">
                                {result.market.direction}
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-[11px] font-bold text-slate-300 text-center uppercase tracking-widest">
                            PRO Analysis | Report Page 02
                        </div>
                    </div>

                    {/* PAGE 3: MARKET INTELLIGENCE (Part 2 - Value) */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col bg-slate-50 overflow-hidden">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-16">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">02 Market Intelligence</h2>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Economic Potential</p>
                        </div>

                        <div className="bg-white p-10 rounded-3xl shadow-sm relative overflow-hidden flex-1 mb-12">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50" />
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-pink-600" />
                                핵심 가치 및 잠재력 (Economic Potential)
                            </h3>
                            <p className="text-base text-slate-600 leading-[1.7] font-medium italic">
                                {result.market.value}
                            </p>
                        </div>

                        <div className="p-8 border-2 border-slate-200 rounded-2xl bg-white/50">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic">Strategic Insight</h4>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                위 가치 제안은 현재 시장의 결핍 요소와 사용자의 페인포인트를 결합하여 도출되었습니다. 초기 타겟 고객군 설정 시 위 잠재 가치를 핵심 메시지로 활용하십시오.
                            </p>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-100 text-[11px] font-bold text-slate-300 text-center uppercase tracking-widest">
                            PRO Analysis | Report Page 03
                        </div>
                    </div>

                    {/* PAGE 4: STRATEGIC ROADMAP (Weeks 1-4) */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col bg-white overflow-hidden">
                        <div className="flex justify-between items-end border-b border-slate-900 pb-6 mb-16">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">04 Strategic Roadmap</h2>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Implementation Phase I</p>
                        </div>

                        <div className="relative border-l-4 border-slate-100 ml-8 pl-12 space-y-12 py-4 flex-1">
                            {result.roadmap.slice(0, 4).map((step: any, idx: number) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[62px] top-0 w-12 h-12 bg-slate-900 rounded-full border-8 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">{step.week}</div>
                                        <div className="text-2xl font-black text-slate-900 mb-4">{step.task.split(':')[0]}</div>
                                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                            {step.task.split(':')[1]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-8 border-t border-slate-100 text-[11px] font-bold text-slate-300 text-center uppercase tracking-widest">
                            Execution Strategy | Report Page 04
                        </div>
                    </div>

                    {/* PAGE 5: STRATEGIC ROADMAP (Weeks 5-8) */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col bg-white overflow-hidden">
                        <div className="flex justify-between items-end border-b border-slate-900 pb-6 mb-16">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">04 Strategic Roadmap</h2>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Implementation Phase II</p>
                        </div>

                        <div className="relative border-l-4 border-slate-100 ml-8 pl-12 space-y-12 py-4 flex-1">
                            {result.roadmap.slice(4, 8).map((step: any, idx: number) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[62px] top-0 w-12 h-12 bg-slate-900 rounded-full border-8 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">{step.week}</div>
                                        <div className="text-2xl font-black text-slate-900 mb-4">{step.task.split(':')[0]}</div>
                                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                            {step.task.split(':')[1]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto p-8 border-2 border-slate-100 rounded-2xl bg-slate-50/50 mb-8 font-bold text-sm">
                            위 로드맵은 MVP(최소 기능 제품) 검증에 최적화된 초기 8주 계획입니다. 4주차 검증 결과에 따라 피벗을 고려하십시오.
                        </div>

                        <div className="pt-8 border-t border-slate-100 text-[11px] font-bold text-slate-300 text-center uppercase tracking-widest">
                            Execution Strategy | Report Page 05
                        </div>
                    </div>

                    {/* PAGE 6: FOOTER & SIGNOFF */}
                    <div className="pdf-page h-[1132px] p-20 flex flex-col bg-slate-900 text-white overflow-hidden">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 mb-20 text-center underline decoration-slate-700 underline-offset-8 decoration-4">Disclaimer & Final Notice</h3>

                        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto space-y-12 pb-20">
                            <div className="text-left space-y-4">
                                <div className="text-3xl font-black italic mb-6">"시작하는 사람이 이깁니다."</div>
                                <p className="text-lg text-slate-300 font-medium leading-[1.8]">
                                    본 리포트는 StartGen AI의 인공지능 분석을 통해 작성되었습니다.
                                    데이터의 정밀함보다 중요한 것은 실행의 속도입니다.
                                    지금 바로 첫 번째 마일스톤(1주차)을 시작하시기 바랍니다.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-12 border-t border-slate-800">
                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-[2]">
                                STARTGEN AI GROUP은 귀하의 도전을 응원합니다.
                                본 데이터는 일반적인 시장 통계와 트렌드를 기반으로 하며,
                                법률, 세무, 금융 및 현업의 특수한 사정에 따라 실제 결과는 달라질 수 있습니다.
                                최종적인 사업의 성패는 창업자의 의지와 시장과의 호흡에 달려 있음을 잊지 마십시오.
                            </div>
                        </div>

                        <div className="mt-auto pt-24 text-center">
                            <div className="flex justify-center gap-4 mb-8">
                                <div className="w-12 h-1 bg-slate-800" />
                                <div className="w-12 h-1 bg-purple-600" />
                                <div className="w-12 h-1 bg-slate-800" />
                            </div>
                            <p className="text-[11px] text-slate-500 font-black tracking-[0.6em] uppercase">
                                © 2026 STARTGEN AI GROUP ALL RIGHTS RESERVED - WWW.STARTGEN.AI
                            </p>
                        </div>
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
