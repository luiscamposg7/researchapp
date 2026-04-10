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
    gray:        { base: "badge-gray",        dot: "text-muted" },
    brand:       { base: "badge-brand",       dot: "text-green-500" },
    error:       { base: "badge-error",       dot: "text-red-400" },
    warning:     { base: "badge-warning",     dot: "text-amber-400" },
    success:     { base: "badge-success",     dot: "text-emerald-500" },
    "gray-blue": { base: "badge-gray-blue",   dot: "text-slate-400" },
    "blue-light":{ base: "badge-blue-light",  dot: "text-sky-400" },
    blue:        { base: "badge-blue",        dot: "text-blue-400" },
    indigo:      { base: "badge-indigo",      dot: "text-indigo-400" },
    purple:      { base: "badge-purple",      dot: "text-purple-400" },
    pink:        { base: "badge-pink",        dot: "text-pink-400" },
    orange:      { base: "badge-orange",      dot: "text-orange-400" },
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
