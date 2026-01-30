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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const formSchema = z.object({
    location: z.string().min(1, { message: "지역을 선택해주세요" }),
    ageGroup: z.string().min(1, { message: "연령대를 선택해주세요" }),
    mbti: z.string().min(1, { message: "MBTI를 선택해주세요" }),
    occupation: z.string().min(1, { message: "직업을 입력해주세요" }),
    budget: z.number().min(0).max(100000000),
    time: z.string().min(1, { message: "투입 가능 시간을 선택해주세요" }),
    interests: z.array(z.string()).min(1, { message: "관심사를 최소 1개 선택해주세요" }).max(3),
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

    const form = useForm<StartupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            location: "",
            ageGroup: "",
            mbti: "",
            occupation: "",
            budget: 10000000,
            time: "",
            interests: [],
        },
    });

    async function onSubmit(data: StartupFormValues) {
        setIsLoading(true);
        // Simulate API delay, pass data to result page via URL for MVP
        setTimeout(() => {
            setIsLoading(false);
            router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
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
                    >
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    나의 프로필 입력 📝
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    정확한 분석을 위해 정보를 입력해주세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Location */}
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">거주 지역</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                <FormLabel className="text-white">연령대</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                <FormLabel className="text-white">MBTI</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                <FormLabel className="text-white">현재 직업/상태</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="예: 개발자, 대학생, 주부" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" {...field} />
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
                                            <FormLabel className="flex justify-between text-white">
                                                <span>초기 자본금</span>
                                                <span className="text-purple-400 font-bold">{field.value?.toLocaleString()}원</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={50000000}
                                                    step={1000000}
                                                    defaultValue={[10000000]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-white/40 text-xs text-right">최대 5,000만원</FormDescription>
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
                                            <FormLabel className="text-white">창업 투입 가능 시간</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                            <FormLabel className="text-white">관심 분야 (최대 3개)</FormLabel>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {INTERESTS.map((interest) => (
                                                    <div
                                                        key={interest}
                                                        className={cn(
                                                            "cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-all",
                                                            field.value?.includes(interest)
                                                                ? "bg-purple-500/20 border-purple-500 text-purple-200"
                                                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                                        )}
                                                        onClick={() => {
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
