import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Dot } from "./dot-icon";

export type BadgeColor =
    | "gray"
    | "brand"
    | "error"
    | "warning"
    | "success"
    | "gray-blue"
    | "blue-light"
    | "blue"
    | "indigo"
    | "purple"
    | "pink"
    | "orange";

export type BadgeType = "pill-color" | "color" | "modern";
export type BadgeSize = "sm" | "md" | "lg";

// Light / dark color classes for each badge color
const colorMap: Record<BadgeColor, { light: string; dark: string; dot: string }> = {
    gray:       { light: "bg-gray-50 text-gray-700 ring-gray-200",         dark: "bg-gray-900 text-gray-300 ring-gray-700",         dot: "text-gray-400" },
    brand:      { light: "bg-green-50 text-green-700 ring-green-200",      dark: "bg-green-950 text-green-300 ring-green-800",      dot: "text-green-500" },
    error:      { light: "bg-red-50 text-red-700 ring-red-200",            dark: "bg-red-950 text-red-300 ring-red-800",            dot: "text-red-400" },
    warning:    { light: "bg-amber-50 text-amber-700 ring-amber-200",      dark: "bg-amber-950 text-amber-300 ring-amber-800",      dot: "text-amber-400" },
    success:    { light: "bg-emerald-50 text-emerald-700 ring-emerald-200",dark: "bg-emerald-950 text-emerald-300 ring-emerald-800", dot: "text-emerald-500" },
    "gray-blue":{ light: "bg-slate-50 text-slate-700 ring-slate-200",      dark: "bg-slate-900 text-slate-300 ring-slate-700",      dot: "text-slate-400" },
    "blue-light":{ light: "bg-sky-50 text-sky-700 ring-sky-200",           dark: "bg-sky-950 text-sky-300 ring-sky-800",            dot: "text-sky-400" },
    blue:       { light: "bg-blue-50 text-blue-700 ring-blue-200",         dark: "bg-blue-950 text-blue-300 ring-blue-800",         dot: "text-blue-400" },
    indigo:     { light: "bg-indigo-50 text-indigo-700 ring-indigo-200",   dark: "bg-indigo-950 text-indigo-300 ring-indigo-800",   dot: "text-indigo-400" },
    purple:     { light: "bg-purple-50 text-purple-700 ring-purple-200",   dark: "bg-purple-950 text-purple-300 ring-purple-800",   dot: "text-purple-400" },
    pink:       { light: "bg-pink-50 text-pink-700 ring-pink-200",         dark: "bg-pink-950 text-pink-300 ring-pink-800",         dot: "text-pink-400" },
    orange:     { light: "bg-orange-50 text-orange-700 ring-orange-200",   dark: "bg-orange-950 text-orange-300 ring-orange-800",   dot: "text-orange-400" },
};

const typeBase: Record<BadgeType, string> = {
    "pill-color": "size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset",
    "color":      "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
    "modern":     "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-sm",
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
    dark?: boolean;
    children: ReactNode;
    className?: string;
}

export const Badge = ({ type = "pill-color", size = "md", color = "gray", dark = false, children, className }: BadgeProps) => {
    const c = colorMap[color];
    const sizes = type === "pill-color" ? pillSizes : badgeSizes;
    return (
        <span className={cx(typeBase[type], sizes[size], dark ? c.dark : c.light, className)}>
            {children}
        </span>
    );
};

interface BadgeWithDotProps {
    type?: BadgeType;
    size?: BadgeSize;
    color?: BadgeColor;
    dark?: boolean;
    children: ReactNode;
    className?: string;
}

export const BadgeWithDot = ({ type = "pill-color", size = "md", color = "gray", dark = false, children, className }: BadgeWithDotProps) => {
    const c = colorMap[color];
    const sizes = type === "pill-color" ? pillSizesWithDot : badgeSizes;
    return (
        <span className={cx(typeBase[type], sizes[size], dark ? c.dark : c.light, className)}>
            <Dot className={c.dot} size="sm" />
            {children}
        </span>
    );
};
