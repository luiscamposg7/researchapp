import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Dot } from "./dot-icon";

export type BadgeColor =
    | "gray" | "brand" | "error" | "warning" | "success"
    | "gray-blue" | "blue-light" | "blue" | "indigo" | "purple" | "pink" | "orange";

export type BadgeType = "pill-color" | "color" | "modern";
export type BadgeSize = "sm" | "md" | "lg";

// Static light/dark color pairs — tokens auto-switch via CSS vars for the dot/ring,
// but badge fill colors are utility-level and defined here.
const colorMap: Record<BadgeColor, { base: string; dot: string }> = {
    gray:        { base: "bg-muted text-secondary ring-[var(--color-border)]",                                                                                    dot: "text-muted" },
    brand:       { base: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-800",                    dot: "text-green-500" },
    error:       { base: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800",                                dot: "text-red-400" },
    warning:     { base: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",                    dot: "text-amber-400" },
    success:     { base: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",        dot: "text-emerald-500" },
    "gray-blue": { base: "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700",                   dot: "text-slate-400" },
    "blue-light":{ base: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",                               dot: "text-sky-400" },
    blue:        { base: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800",                         dot: "text-blue-400" },
    indigo:      { base: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800",              dot: "text-indigo-400" },
    purple:      { base: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-800",              dot: "text-purple-400" },
    pink:        { base: "bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:ring-pink-800",                         dot: "text-pink-400" },
    orange:      { base: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800",              dot: "text-orange-400" },
};

const typeBase: Record<BadgeType, string> = {
    "pill-color": "size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset",
    "color":      "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
    "modern":     "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-sm bg-surface text-secondary ring-[var(--color-border)]",
};

const pillSizes: Record<BadgeSize, string> = {
    sm: "py-0.5 px-2 text-xs font-medium",
    md: "py-0.5 px-2.5 text-sm font-medium",
    lg: "py-1 px-3 text-sm font-medium",
};

const badgeSizes: Record<BadgeSize, string> = {
    sm: "py-0.5 px-1.5 text-xs font-medium",
    md: "py-0.5 px-2 text-sm font-medium",
    lg: "py-1 px-2.5 text-sm font-medium rounded-lg",
};

const pillSizesWithDot: Record<BadgeSize, string> = {
    sm: "gap-1 py-0.5 pl-1.5 pr-2 text-xs font-medium",
    md: "gap-1.5 py-0.5 pl-2 pr-2.5 text-sm font-medium",
    lg: "gap-1.5 py-1 pl-2.5 pr-3 text-sm font-medium",
};

interface BadgeProps {
    type?: BadgeType;
    size?: BadgeSize;
    color?: BadgeColor;
    /** @deprecated handled automatically via CSS tokens */
    dark?: boolean;
    children: ReactNode;
    className?: string;
}

export const Badge = ({ type = "pill-color", size = "md", color = "gray", children, className }: BadgeProps) => {
    const c = colorMap[color];
    const sizes = type === "pill-color" ? pillSizes : badgeSizes;
    return (
        <span className={cx(typeBase[type], sizes[size], type !== "modern" && c.base, className)}>
            {children}
        </span>
    );
};

interface BadgeWithDotProps {
    type?: BadgeType;
    size?: BadgeSize;
    color?: BadgeColor;
    /** @deprecated handled automatically via CSS tokens */
    dark?: boolean;
    children: ReactNode;
    className?: string;
}

export const BadgeWithDot = ({ type = "pill-color", size = "md", color = "gray", children, className }: BadgeWithDotProps) => {
    const c = colorMap[color];
    const sizes = type === "pill-color" ? pillSizesWithDot : badgeSizes;
    return (
        <span className={cx(typeBase[type], sizes[size], type !== "modern" && c.base, className)}>
            <Dot className={c.dot} size="sm" />
            {children}
        </span>
    );
};
