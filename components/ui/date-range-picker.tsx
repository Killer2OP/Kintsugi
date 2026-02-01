"use client";

import * as React from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePreset {
    label: string;
    getValue: () => DateRange;
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    className?: string;
}

const presets: DateRangePreset[] = [
    {
        label: "Today",
        getValue: () => ({
            from: new Date(),
            to: new Date(),
        }),
    },
    {
        label: "Last 7 days",
        getValue: () => ({
            from: subDays(new Date(), 7),
            to: new Date(),
        }),
    },
    {
        label: "Last 14 days",
        getValue: () => ({
            from: subDays(new Date(), 14),
            to: new Date(),
        }),
    },
    {
        label: "Last 30 days",
        getValue: () => ({
            from: subDays(new Date(), 30),
            to: new Date(),
        }),
    },
    {
        label: "Last 90 days",
        getValue: () => ({
            from: subDays(new Date(), 90),
            to: new Date(),
        }),
    },
    {
        label: "This month",
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
    {
        label: "Last month",
        getValue: () => ({
            from: startOfMonth(subMonths(new Date(), 1)),
            to: endOfMonth(subMonths(new Date(), 1)),
        }),
    },
];

export function DateRangePicker({
    value,
    onChange,
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedRange, setSelectedRange] = React.useState<DateRange>(
        value || presets[3].getValue() // Default to last 30 days
    );
    const [activePreset, setActivePreset] = React.useState<string>("Last 30 days");

    const handlePresetClick = (preset: DateRangePreset) => {
        const range = preset.getValue();
        setSelectedRange(range);
        setActivePreset(preset.label);
        onChange?.(range);
        setOpen(false);
    };

    const formatDateRange = () => {
        if (selectedRange.from && selectedRange.to) {
            if (
                format(selectedRange.from, "yyyy-MM-dd") ===
                format(selectedRange.to, "yyyy-MM-dd")
            ) {
                return format(selectedRange.from, "MMM d, yyyy");
            }
            return `${format(selectedRange.from, "MMM d")} - ${format(
                selectedRange.to,
                "MMM d, yyyy"
            )}`;
        }
        return "Select date range";
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`justify-start text-left font-normal h-9 ${className}`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{formatDateRange()}</span>
                    <span className="sm:hidden">{activePreset}</span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-64 p-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl"
                align="end"
            >
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-white">
                        Select Date Range
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                        Choose a preset or custom range
                    </p>
                </div>
                <div className="p-2 space-y-1">
                    {presets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => handlePresetClick(preset)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                activePreset === preset.label
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                        >
                            {preset.label}
                            {activePreset === preset.label && (
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                >
                                    Active
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    Showing data from {format(selectedRange.from, "MMM d")} to{" "}
                    {format(selectedRange.to, "MMM d, yyyy")}
                </div>
            </PopoverContent>
        </Popover>
    );
}
