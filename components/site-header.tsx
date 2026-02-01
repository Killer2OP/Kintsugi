"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { Search } from "lucide-react";

export function SiteHeader() {
    const { open, setOpen } = useCommandPalette();

    return (
        <>
            <CommandPalette open={open} onOpenChange={setOpen} />
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
                <div className="flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4"
                    />
                    <h1 className="text-sm sm:text-base font-medium truncate font-serif tracking-wide text-amber-600 dark:text-amber-500">
                        Kintsugi
                    </h1>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(true)}
                            className="h-9 w-9"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                        
                        {/* Notification Center */}
                        <NotificationCenter />
                        
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            asChild
                            size="sm"
                            className="hidden sm:flex"
                        >
                            <a
                                href="https://github.com/Killer2OP"
                                rel="noopener noreferrer"
                                target="_blank"
                                className="dark:text-foreground"
                            >
                                GitHub
                            </a>
                        </Button>
                    </div>
                </div>
            </header>
        </>
    );
}

