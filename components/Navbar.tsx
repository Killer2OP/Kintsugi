"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import { Bot, Menu, ArrowRight, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";

const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/repository" },
    { name: "Failures", href: "/failures" },
];

export function Navbar() {
    const pathname = usePathname();
    const { open, setOpen } = useCommandPalette();

    const isActiveRoute = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            <CommandPalette open={open} onOpenChange={setOpen} />
            <header className="flex items-center justify-center sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
                <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className="size-9 md:hidden"
                                    variant="ghost"
                                    size="icon"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="w-56 p-2 md:hidden"
                            >
                                <NavigationMenu className="max-w-none">
                                    <NavigationMenuList className="flex-col items-start space-y-1">
                                        {navigationItems.map((link, index) => (
                                            <NavigationMenuItem
                                                key={index}
                                                className="w-full"
                                            >
                                                <NavigationMenuLink
                                                    href={link.href}
                                                    active={isActiveRoute(
                                                        link.href
                                                    )}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        isActiveRoute(link.href)
                                                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    }`}
                                                >
                                                    {link.name}
                                                </NavigationMenuLink>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </PopoverContent>
                        </Popover>

                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="hidden font-semibold text-zinc-900 dark:text-white sm:inline-block font-serif tracking-wide">
                                Kintsugi
                            </span>
                        </Link>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                        <NavigationMenu>
                            <NavigationMenuList className="flex items-center gap-1">
                                {navigationItems.map((link, index) => (
                                    <NavigationMenuItem key={index}>
                                        <NavigationMenuLink
                                            href={link.href}
                                            active={isActiveRoute(link.href)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActiveRoute(link.href)
                                                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            }`}
                                        >
                                            {link.name}
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(true)}
                            className="h-9 w-9 hidden sm:flex"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                        
                        {/* Notification Center */}
                        <NotificationCenter />
                        
                        <ThemeToggle />
                        
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all duration-200 group"
                        >
                            <span className="hidden sm:inline">Get Started</span>
                            <span className="sm:hidden">Go</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}

