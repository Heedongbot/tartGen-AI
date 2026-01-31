"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2, Sparkles, Lock, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

const formSchema = z.object({
    // Basic Filters (FREE)
    continent: z.string().min(1, { message: "대륙을 선택해주세요" }),
    growthSpeed: z.string().min(1, { message: "성장 속도를 선택해주세요" }),
    marketSize: z.string().min(1, { message: "시장 규모를 선택해주세요" }),

    // Personalized Filters (PRO) - making optional in schema but required for PRO flow
    location: z.string().optional(),
    ageGroup: z.string().optional(),
    mbti: z.string().optional(),
    occupation: z.string().optional(),
    budget: z.number().optional(),
    time: z.string().optional(),
    interests: z.array(z.string()).optional(),
});

export type StartupFormValues = z.infer<typeof formSchema>;

const MBTI_TYPES = [
    "ISTJ", "ISFJ", "INFJ", "INTJ",
    "ISTP", "ISFP", "INFP", "INTP",
    "ESTP", "ESFP", "ENFP", "ENTP",
    "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

const INTERESTS = [
    "IT/테크", "패션/뷰티", "푸드/요식업", "교육", "헬스케어",
    "금융/재테크", "부동산", "여행", "반려동물", "육아",
    "게임", "콘텐츠", "친환경", "이커머스"
];

const CONTINENTS = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
const GROWTH_SPEEDS = [
    { label: "폭발적 성장 (Rapid)", value: "Rapid" },
    { label: "안정적 수익 (Moderate)", value: "Moderate" },
    { label: "틈새시장 (Niche)", value: "Niche" }
];
const MARKET_SIZES = [
    { label: "매스 마켓 (Huge)", value: "Huge" },
    { label: "중형 마켓 (Medium)", value: "Medium" },
    { label: "마이크로 마켓 (Small)", value: "Small" }
];

const AGE_GROUPS = ["20대", "30대", "40대", "50대+"];
const LOCATIONS = ["서울", "경기/인천", "부산/경남", "대구/경북", "광주/전라", "대전/충청", "강원/제주", "해외 (Global)"];
const TIMES = [
    { label: "주말만 (Weekend)", value: "Weekend" },
    { label: "평일 저녁 (1-2시간)", value: "Evening" },
    { label: "파트타임 (4시간 이상)", value: "PartTime" },
    { label: "전업 (Full-time)", value: "FullTime" }
];

export function StartupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // For MVP, being logged in = PRO features unlocked for testing/demo
    // In production, this would check user metadata or database field
    const isPro = !!user;

    const form = useForm<StartupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            continent: "",
            growthSpeed: "",
            marketSize: "",
            location: "",
            ageGroup: "",
            mbti: "",
            occupation: "",
            budget: 5000000,
            time: "",
            interests: [],
        },
    });

    async function onSubmit(data: StartupFormValues) {
        setIsLoading(true);
        // Add tier info to data
        const enrichedData = {
            ...data,
            tier: isPro ? "PRO" : "FREE"
        };

        setTimeout(() => {
            setIsLoading(false);
            router.push(`/result?data=${encodeURIComponent(JSON.stringify(enrichedData))}`);
        }, 1500);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* 1. Basic Filters (FREE) */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white">
                                            기본 설정 (Market Settings) 🌐
                                        </CardTitle>
                                        <CardDescription className="text-white/40">
                                            누구나 무료로 이용 가능한 기본 분석 필터입니다.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">FREE</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Continent */}
                                <FormField
                                    control={form.control}
                                    name="continent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">타겟 대륙</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="대륙 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    {CONTINENTS.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Growth Speed */}
                                <FormField
                                    control={form.control}
                                    name="growthSpeed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">희망 성장 속도</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="속도 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    {GROWTH_SPEEDS.map((s) => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Market Size */}
                                <FormField
                                    control={form.control}
                                    name="marketSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80">시장 규모</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="규모 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    {MARKET_SIZES.map((m) => (
                                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* 2. Personalized Filters (PRO) */}
                        <div className="relative">
                            {!isPro && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl border border-white/5 animate-in fade-in duration-500">
                                    <div className="p-6 bg-[#1a0b2e]/90 border border-purple-500/30 rounded-2xl shadow-2xl text-center max-w-sm space-y-4 transform hover:scale-105 transition-transform">
                                        <div className="size-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">나만을 위한 초정밀 분석 🔓</h3>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            MBTI, 구체적 지역, 자본금 등 개인화된 필터를 사용하려면 <b>PRO 플랜</b>이 필요합니다.
                                        </p>
                                        <div className="pt-2">
                                            <Link href="/pricing">
                                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-900/40">
                                                    PRO 업그레이드 하러 가기 <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest letter-spacing-1">14 Days Free trial available</p>
                                    </div>
                                </div>
                            )}

                            <Card className={cn(
                                "border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500",
                                !isPro && "opacity-40 grayscale-[0.5] select-none pointer-events-none"
                            )}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                                개인화 프로필 (Advanced Profile) ✨
                                            </CardTitle>
                                            <CardDescription className="text-white/60">
                                                성격, 자산, 환경을 고려한 세상에 하나뿐인 아이디어를 생성합니다.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                                            <Zap className="w-3 h-3 fill-current" /> PRO
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Location */}
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80">상세 거주 지역</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPro}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="지역 선택" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-gray-900 border-white/10">
                                                            {LOCATIONS.map((loc) => (
                                                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Age Group */}
                                        <FormField
                                            control={form.control}
                                            name="ageGroup"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80">연령대</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPro}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="선택" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-gray-900 border-white/10">
                                                            {AGE_GROUPS.map((age) => (
                                                                <SelectItem key={age} value={age}>{age}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* MBTI */}
                                        <FormField
                                            control={form.control}
                                            name="mbti"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80">나의 MBTI</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPro}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                                <SelectValue placeholder="유형 선택" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-gray-900 border-white/10 h-64" position="popper">
                                                            {MBTI_TYPES.map((type) => (
                                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Occupation */}
                                        <FormField
                                            control={form.control}
                                            name="occupation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80">현재 직업/상태</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="예: 개발자, 대학생, 주부" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" {...field} disabled={!isPro} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Budget */}
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex justify-between text-white/80">
                                                    <span>초기 자본금</span>
                                                    <span className="text-purple-400 font-bold">{field.value?.toLocaleString()}원</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={50000000}
                                                        step={1000000}
                                                        defaultValue={[5000000]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                        className="py-4"
                                                        disabled={!isPro}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-white/40 text-[10px] text-right">최대 5,000만원</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Time Commitment */}
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">창업 투입 가능 시간</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPro}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                            <SelectValue placeholder="시간 선택" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-gray-900 border-white/10">
                                                        {TIMES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Interests */}
                                    <FormField
                                        control={form.control}
                                        name="interests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80">관심 분야 (최대 3개)</FormLabel>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {INTERESTS.map((interest) => (
                                                        <div
                                                            key={interest}
                                                            className={cn(
                                                                "cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-all",
                                                                field.value?.includes(interest)
                                                                    ? "bg-purple-500/20 border-purple-500 text-purple-200"
                                                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white",
                                                                !isPro && "pointer-events-none opacity-50"
                                                            )}
                                                            onClick={() => {
                                                                if (!isPro) return;
                                                                const current = field.value || [];
                                                                if (current.includes(interest)) {
                                                                    field.onChange(current.filter((i) => i !== interest));
                                                                } else {
                                                                    if (current.length < 3) {
                                                                        field.onChange([...current, interest]);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {interest}
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center pt-8"
                    >
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full md:w-auto h-14 px-12 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    시장 분석 중...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    무료로 아이디어 받아보기
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </form>
        </Form>
    );
}
