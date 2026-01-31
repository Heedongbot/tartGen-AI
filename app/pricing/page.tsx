"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Clock, ShieldCheck, Mail, MessageSquare, Download, BarChart3, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const pricingPlans = [
    {
        name: "FREE",
        price: "0",
        description: "제품 체험 및 바이럴용",
        features: [
            { text: "하루 3개 아이디어 생성", icon: <Sparkles className="w-4 h-4" />, disabled: false },
            { text: "기본 필터 (대륙, 성장속도, 시장규모)", icon: <SlidersHorizontal className="w-4 h-4" />, disabled: false },
            { text: "제품 추천 1개", icon: <Plus className="w-4 h-4" />, disabled: false },
            { text: "아이디어 저장 불가", icon: <Plus className="w-4 h-4 disabled" />, disabled: true },
        ],
        buttonText: "시작하기",
        highlight: false,
    },
    {
        name: "PRO",
        priceMonth: "9.99",
        priceYear: "99",
        description: "성장을 위한 모든 도구 포함",
        features: [
            { text: "무제한 아이디어 생성", icon: <Zap className="w-4 h-4" />, disabled: false },
            { text: "모든 필터 (지역/나이/MBTI/직업 등)", icon: <SlidersHorizontal className="w-4 h-4" />, disabled: false },
            { text: "무제한 저장 & 관리", icon: <ShieldCheck className="w-4 h-4" />, disabled: false },
            { text: "상세 시장 데이터", icon: <BarChart3 className="w-4 h-4" />, disabled: false },
            { text: "MBTI 맞춤 로드맵", icon: <Clock className="w-4 h-4" />, disabled: false },
            { text: "제품 추천 10개 (제휴 링크)", icon: <Plus className="w-4 h-4" />, disabled: false },
            { text: "PDF 다운로드", icon: <Download className="w-4 h-4" />, disabled: false },
            { text: "AI 멘토 챗봇", icon: <MessageSquare className="w-4 h-4" />, disabled: false },
            { text: "광고 제거", icon: <Check className="w-4 h-4" />, disabled: false },
            { text: "24시간 전용 지원", icon: <Mail className="w-4 h-4" />, disabled: false },
        ],
        buttonText: "무료 체험 시작하기",
        highlight: true,
    },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0414] py-20 px-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[0%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
                    >
                        당신의 아이디어를 비즈니스로
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/60 mb-10 max-w-2xl mx-auto"
                    >
                        성공적인 창업을 위한 가장 스마트한 시작. 지금 바로 프로 플랜을 경험해보세요.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mb-12"
                    >
                        <span className={`text-sm ${!isYearly ? 'text-white' : 'text-white/40'}`}>월간 결제</span>
                        <Switch
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                            className="data-[state=checked]:bg-purple-600"
                        />
                        <span className={`text-sm flex items-center gap-2 ${isYearly ? 'text-white' : 'text-white/40'}`}>
                            연간 결제 <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold">17% 할인</span>
                        </span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {pricingPlans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="h-full"
                        >
                            <Card className={`relative h-full border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 ${plan.highlight ? 'ring-2 ring-purple-500/50' : ''}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-purple-500/20">
                                            Best Value
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8 border-b border-white/5">
                                    <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-4xl font-extrabold text-white">
                                            ${plan.name === "FREE" ? plan.price : (isYearly ? plan.priceYear : plan.priceMonth)}
                                        </span>
                                        <span className="text-white/40 text-sm">/{isYearly && plan.name !== "FREE" ? '년' : '월'}</span>
                                    </div>
                                    <CardDescription className="mt-4 text-white/50">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-4">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className={`flex items-start gap-3 text-sm ${feature.disabled ? 'text-white/20 line-through' : 'text-white/80'}`}>
                                            <div className={`mt-0.5 ${feature.disabled ? 'text-white/20' : 'text-purple-400'}`}>
                                                {feature.icon}
                                            </div>
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="pt-8">
                                    <Link href={plan.highlight ? "/login" : "/"} className="w-full">
                                        <Button
                                            className={`w-full h-12 text-lg font-bold transition-all ${plan.highlight
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/20'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Promotion Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl px-6 py-4 backdrop-blur-md">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-bold">🎁 얼리버드 특전: 14일 무료 체험</div>
                            <div className="text-white/60 text-sm">3월 31일까지 가입 시 모든 혜택을 2주간 무료로 이용하세요.</div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-20 text-center text-white/40 text-sm">
                    궁금한 점이 있으신가요? <Link href="#" className="underline hover:text-white transition-colors">자주 묻는 질문(FAQ)</Link>을 확인하거나 24시간 지원팀에 문의하세요.
                </div>
            </div>
        </div>
    );
}
