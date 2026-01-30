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
    location: z.string().min(2, { message: "Location is required" }),
    ageGroup: z.string().min(1, "Please select an age group"),
    mbti: z.string().min(1, "Please select your MBTI"),
    occupation: z.string().min(2, { message: "Occupation is required" }),
    budget: z.number().min(0).max(50000000),
    time: z.string().min(1, "Please select time commitment"),
    interests: z.array(z.string()).min(1, { message: "Select at least 1 interest" }).max(3),
    continent: z.string().min(1, "Select target continent"),
    growthSpeed: z.string().min(1, "Select growth speed"),
    marketSize: z.string().min(1, "Select market size"),
});

export type StartupFormValues = z.infer<typeof formSchema>;

const MBTI_TYPES = [
    "ISTJ", "ISFJ", "INFJ", "INTJ",
    "ISTP", "ISFP", "INFP", "INTP",
    "ESTP", "ESFP", "ENFP", "ENTP",
    "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

const INTERESTS = [
    "Tech/IT", "Fashion", "Food", "Education", "Healthcare",
    "Finance", "Real Estate", "Travel", "Pets", "Parenting",
    "Beauty", "Gaming", "Content", "Eco-friendly"
];

const AGE_GROUPS = ["20s", "30s", "40s", "50+"];
const CONTINENTS = ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];

export function StartupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<StartupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            budget: 5000000,
            interests: [],
        },
    });

    async function onSubmit(data: StartupFormValues) {
        setIsLoading(true);
        // Simulate API delay, pass data to result page via URL for MVP
        setTimeout(() => {
            setIsLoading(false);
            router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
        }, 1000);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Section 1: Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    Step 1: About You ✨
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Tell us about yourself so we can tailor the idea.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Location */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Seoul, Korea" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Age Group */}
                                    <FormField
                                        control={form.control}
                                        name="ageGroup"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Age</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                            <SelectValue placeholder="Select" />
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
                                                            <SelectValue placeholder="Type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-gray-900 border-white/10 h-64">
                                                        {MBTI_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Occupation */}
                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Occupation</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Developer" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Budget */}
                                <FormField
                                    control={form.control}
                                    name="budget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex justify-between text-white">
                                                <span>Budget</span>
                                                <span className="text-purple-400 font-bold">₩{field.value?.toLocaleString()}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={50000000}
                                                    step={100000}
                                                    defaultValue={[5000000]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
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
                                            <FormLabel className="text-white">Interests (Max 3)</FormLabel>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {INTERESTS.map((interest) => (
                                                    <div
                                                        key={interest}
                                                        className={cn(
                                                            "cursor-pointer px-3 py-1 rounded-full text-xs border transition-all",
                                                            field.value?.includes(interest)
                                                                ? "bg-purple-500/20 border-purple-500 text-purple-200"
                                                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
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

                    {/* Section 2: Market */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                    Step 2: Market Prefs 🌍
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Where and how do you want to succeed?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1">
                                {/* Continent */}
                                <FormField
                                    control={form.control}
                                    name="continent"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-white">Target Region</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {CONTINENTS.map((item) => (
                                                        <FormItem key={item}>
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value={item}
                                                                    className="peer sr-only"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:text-white peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/20 peer-data-[state=checked]:text-blue-200 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                                                {item}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
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
                                            <FormLabel className="text-white">Growth Pace</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    <SelectItem value="Fast">Fast 🚀</SelectItem>
                                                    <SelectItem value="Moderate">Moderate 📊</SelectItem>
                                                    <SelectItem value="Slow">Steady 🐢</SelectItem>
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
                                            <FormLabel className="text-white">Market Size</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    <SelectItem value="Large">Large 💎</SelectItem>
                                                    <SelectItem value="Medium">Medium 📦</SelectItem>
                                                    <SelectItem value="Niche">Niche 🎯</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Time Commitment (Moved here or Section 1, putting here to balance) */}
                                <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Time Commitment</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-900 border-white/10">
                                                    <SelectItem value="Weekend">Weekend Only</SelectItem>
                                                    <SelectItem value="Evening">Weeknights (2-3h)</SelectItem>
                                                    <SelectItem value="PartTime">Part-time (4-6h)</SelectItem>
                                                    <SelectItem value="FullTime">Full-time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center pt-8"
                >
                    <Button
                        type="submit"
                        size="lg"
                        className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing 1,240+ Markets...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Generate My Startup Idea
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>
        </Form>
    );
}
