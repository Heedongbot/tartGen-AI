"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { StartupFormValues } from "@/components/startup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Download, Share2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
                const data = await res.json();
                setResult(data);
            } catch (error) {
                console.error("Failed to generate idea", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dataParam]);

    if (!dataParam) {
        return <div className="text-white text-center py-20">No data found. Go back home.</div>;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
                <h2 className="text-2xl font-bold">Analyzing Market Data...</h2>
                <p className="text-white/60">Finding the perfect opportunity for you.</p>
            </div>
        );
    }

    if (!result) return <div className="text-white text-center">Failed to load result.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                    <div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-purple-500/20 text-purple-200 mb-2">
                            Match Score: 94% ⭐
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">{result.title}</h1>
                        <p className="text-xl text-white/80 max-w-2xl">{result.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Grid */}
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
                                <CardTitle className="text-white">✨ Why this fits you</CardTitle>
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
                                <CardTitle className="text-white">📊 Market Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-4 rounded-xl bg-white/5">
                                        <div className="text-sm text-white/50 mb-1">Market Size</div>
                                        <div className="text-2xl font-bold text-white">{result.market.size}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5">
                                        <div className="text-sm text-white/50 mb-1">Growth</div>
                                        <div className="text-2xl font-bold text-green-400">{result.market.growth}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5">
                                        <div className="text-sm text-white/50 mb-1">Competition</div>
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
                                <CardTitle className="text-white">🗺️ 8-Week Roadmap</CardTitle>
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
                                <CardTitle className="text-white">🛍️ Recommended Tools</CardTitle>
                                <CardDescription className="text-white/50">Start with these essentials</CardDescription>
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

            <div className="flex justify-center pt-8 pb-20">
                <Link href="/">
                    <Button size="lg" variant="secondary" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Generate Another Idea
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}
