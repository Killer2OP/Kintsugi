"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
// import { Marquee } from "@/components/ui/marquee";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
    Search, 
    Bot, 
    Wrench, 
    BarChart3, 
    Radio, 
    Link2, 
    Zap, 
    FolderGit2, 
    Bug, 
    CheckCircle2,
    ArrowRight,
    Sparkles
} from "lucide-react";

const useCountAnimation = (
    end: number,
    duration: number = 2,
    delay: number = 0
) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasStarted(true);
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min(
                (currentTime - startTime) / (duration * 1000),
                1
            );

            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * end);

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration, hasStarted]);

    return count;
};

interface featureProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const features: featureProps[] = [
    {
        title: "Automated Failure Detection",
        description:
            "Automatically detect CI/CD pipeline failures and workflow issues across your repositories with real-time monitoring.",
        icon: <Search className="w-6 h-6" />,
    },
    {
        title: "AI-Powered Analysis",
        description:
            "Leverage Gemini 2.5 Pro and Portia AI to analyze error logs and provide intelligent insights into failure causes.",
        icon: <Bot className="w-6 h-6" />,
    },
    {
        title: "Smart Fix Suggestions",
        description:
            "Get automated fix suggestions for common CI/CD issues with detailed explanations and implementation steps.",
        icon: <Wrench className="w-6 h-6" />,
    },
    {
        title: "Repository Analytics",
        description:
            "Monitor repository health with comprehensive analytics, failure trends, and performance insights.",
        icon: <BarChart3 className="w-6 h-6" />,
    },
    {
        title: "Real-time Monitoring",
        description:
            "Stay updated with real-time webhook notifications and live monitoring of your CI/CD pipeline status.",
        icon: <Radio className="w-6 h-6" />,
    },
    {
        title: "GitHub Integration",
        description:
            "Seamlessly integrate with GitHub repositories and workflows for streamlined CI/CD management.",
        icon: <Link2 className="w-6 h-6" />,
    },
];

const AnimatedStatNumber = ({
    stat,
    delay,
}: {
    stat: (typeof stats)[0];
    delay: number;
}) => {
    const count = useCountAnimation(stat.numericValue, 2.5, delay);

    const formatNumber = (num: number) => {
        if (stat.suffix === "%" || num < 1000) return num;
        if (num >= 10000)
            return `${Math.floor(num / 1000)},${(num % 1000)
                .toString()
                .padStart(3, "0")}`;
        return num.toString();
    };

    return (
        <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                delay: delay + 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
            }}
        >
            {formatNumber(count)}
            {stat.suffix}
        </motion.span>
    );
};

const stats = [
    {
        number: "99.9%",
        numericValue: 99,
        suffix: "%",
        label: "Uptime Reliability",
        icon: <Zap className="w-5 h-5" />,
    },
    {
        number: "6+",
        numericValue: 6,
        suffix: "+",
        label: "Active Repositories",
        icon: <FolderGit2 className="w-5 h-5" />,
    },
    {
        number: "50+",
        numericValue: 50,
        suffix: "+",
        label: "Issues Analyzed",
        icon: <Bug className="w-5 h-5" />,
    },
    {
        number: "95%",
        numericValue: 95,
        suffix: "%",
        label: "Fix Accuracy",
        icon: <CheckCircle2 className="w-5 h-5" />,
    },
];

const testimonials = [
    {
        name: "Sarah Martinez",
        role: "DevOps Engineer",
        content:
            "Kintsugi revolutionized our deployment process! The AI-powered analysis caught issues we would have missed.",
        avatar: "SM",
        rating: 5,
    },
    {
        name: "Michael Chen",
        role: "Site Reliability Engineer",
        content:
            "The automated failure detection and smart fix suggestions saved our team countless hours of debugging.",
        avatar: "MC",
        rating: 5,
    },
    {
        name: "Emily Rodriguez",
        role: "Platform Engineer",
        content:
            "Real-time monitoring and repository analytics give us complete visibility into our CI/CD pipeline health.",
        avatar: "ER",
        rating: 5,
    },
    {
        name: "David Kim",
        role: "Infrastructure Lead",
        content:
            "The GitHub integration is seamless. We can track and fix pipeline issues without switching contexts.",
        avatar: "DK",
        rating: 5,
    },
    {
        name: "Lisa Wang",
        role: "Release Manager",
        content:
            "Gemini and Portia AI provide incredibly accurate analysis. Our deployment reliability has improved dramatically.",
        avatar: "LW",
        rating: 5,
    },
    {
        name: "Alex Thompson",
        role: "DevOps Architect",
        content:
            "This tool is a game-changer for CI/CD management. The fix suggestions are spot-on and save us so much time.",
        avatar: "AT",
        rating: 5,
    },
];



export default function HomePage() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <>
            <Navbar />
            <div>
                {/* Hero Section - Clean & Modern */}
                <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b]">
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 grid-pattern dark:grid-pattern-dark" />
                    
                    {/* Subtle Gradient Orbs */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 md:py-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="mb-8 inline-flex"
                            >
                                <Badge
                                    variant="outline"
                                    className="px-4 py-2 text-sm font-medium bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    AI-Powered Workflow Repair
                                </Badge>
                            </motion.div>

                            {/* Main Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                            >
                                <span className="text-zinc-900 dark:text-white">Repair Your Workflows</span>
                                <br />
                                <span className="gradient-text-hero">With Golden Precision</span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                            >
                                Automatically detect fractures in your pipelines and apply intelligent, golden repairs.
                                Transform broken workflows into resilient, stronger systems.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                            >
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 group"
                                >
                                    View Kintsugi Dashboard
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/repository"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300"
                                >
                                    View Analytics
                                </Link>
                            </motion.div>

                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-wrap justify-center items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Real-time Monitoring</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>AI-Powered Analysis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>GitHub Integration</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <motion.section
                    className="py-24 w-full bg-zinc-50 dark:bg-zinc-900/50"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 },
                        },
                    }}
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge
                                variant="outline"
                                className="mb-4 px-3 py-1.5 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                            >
                                Features
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                                Smart CI/CD Monitoring
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                Powerful features designed for reliable workflow monitoring and automated repair
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 card-interactive">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                                                {feature.icon}
                                            </div>
                                            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Stats Section */}
                <motion.section
                    className="py-24 w-full bg-zinc-900 dark:bg-black"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 },
                    }}
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-4 px-3 py-1.5 bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
                                Performance
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Reliable Workflow Monitoring
                            </h2>                  <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                Track your CI/CD pipeline performance with real-time monitoring and AI-powered failure analysis
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        <AnimatedStatNumber stat={stat} delay={0.5 + idx * 0.1} />
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all duration-300 group"
                            >
                                Get Started Today
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                    className="py-24 w-full bg-zinc-50 dark:bg-zinc-900/20 relative overflow-hidden"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 },
                    }}
                >
                    {/* Decorative divider */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                    <div className="container mx-auto px-4 md:px-6">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge
                                variant="outline"
                                className="mb-4 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                            >
                                Testimonials
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                                Trusted by Engineering Teams
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                                See how Kintsugi helps teams repair their workflows and maintain golden standards in production.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                        
                                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-lg border border-amber-200 dark:border-amber-700/50">
                                                    {testimonial.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-zinc-900 dark:text-white">{testimonial.name}</h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{testimonial.role}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 mb-6">
                                                <div className="relative">
                                                    <span className="absolute -top-4 -left-2 text-4xl text-amber-200 dark:text-amber-900/40 font-serif">"</span>
                                                    <p className="text-zinc-600 dark:text-zinc-300 italic relative z-10 leading-relaxed">
                                                        {testimonial.content}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-1 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                                {[...Array(5)].map((_, i) => (
                                                    <Sparkles key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.section
                    className="py-24 text-center bg-zinc-900 dark:bg-black relative overflow-hidden"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 },
                    }}
                >
                    {/* Subtle gradient background */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px]" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-6 px-4 py-2 bg-white/10 border-white/20 text-white">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Start Repairing Today
                            </Badge>
                            
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                <span className="text-white">Ready to Restore</span>
                                <br />
                                <span className="gradient-text-hero">Your Workflows?</span>
                            </h2>
                            
                            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                                Start monitoring your CI/CD pipelines with AI-powered failure detection 
                                and automated fix suggestions. Improve your deployment reliability today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 group"
                                >
                                    <Wrench className="w-5 h-5 mr-2" />
                                    Start Repairing
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Real-time Monitoring</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>AI-Powered Analysis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Start Immediately</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

