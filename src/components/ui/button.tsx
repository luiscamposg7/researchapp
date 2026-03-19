import type { ButtonHTMLAttributes, DetailedHTMLProps, FC, ReactNode } from "react";
import React, { isValidElement } from "react";
import { cx } from "@/lib/cx";
import { isReactComponent } from "@/lib/is-react-component";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonColor =
    | "primary"
    | "secondary"
    | "tertiary"
    | "link-gray"
    | "link-color"
    | "primary-destructive"
    | "secondary-destructive"
    | "tertiary-destructive"
    | "link-destructive";

export interface ButtonProps
    extends DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">, HTMLButtonElement> {
    size?: ButtonSize;
    color?: ButtonColor;
    /** @deprecated handled automatically via CSS tokens */
    dark?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    iconLeading?: FC<{ className?: string }> | ReactNode;
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    noTextPadding?: boolean;
    showTextWhileLoading?: boolean;
}

const iconCls = "pointer-events-none w-5 h-5 shrink-0 transition-all duration-100";

const sizeStyles: Record<ButtonSize, string> = {
    xs: "gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
    sm: "gap-1 rounded-lg px-3 py-2 text-sm font-semibold",
    md: "gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold",
    lg: "gap-1.5 rounded-lg px-4 py-2.5 text-base font-semibold",
    xl: "gap-1.5 rounded-lg px-[18px] py-3 text-base font-semibold",
};

const SHADOW_SKEU = "shadow-[0px_1px_2px_rgba(10,13,18,0.05),0px_0px_0px_1px_rgba(10,13,18,0.18)_inset,0px_-2px_0px_rgba(10,13,18,0.05)_inset]";

const colorStyles: Record<ButtonColor, string> = {
    primary: cx(
        "bg-brand text-white ring-1 ring-transparent ring-inset",
        SHADOW_SKEU,
        "hover:bg-[var(--color-brand-hover)] data-[loading]:bg-[var(--color-brand-hover)]",
        "disabled:bg-muted disabled:text-muted disabled:shadow-sm disabled:ring-[var(--color-border)]",
    ),
    secondary: cx(
        "bg-surface text-secondary ring-1 ring-[var(--color-border)] ring-inset",
        SHADOW_SKEU,
        "hover:bg-hover hover:text-primary data-[loading]:bg-hover",
        "disabled:bg-muted disabled:text-muted disabled:shadow-sm",
    ),
    tertiary: cx(
        "text-tertiary",
        "hover:bg-hover hover:text-secondary data-[loading]:bg-hover",
        "disabled:text-muted",
    ),
    "link-gray": cx(
        "text-tertiary",
        "hover:text-secondary",
        "disabled:text-muted",
    ),
    "link-color": cx(
        "text-brand",
        "hover:text-[var(--color-brand-hover)]",
        "disabled:text-muted",
    ),
    "primary-destructive": cx(
        "bg-red-600 text-white ring-1 ring-transparent ring-inset",
        SHADOW_SKEU,
        "hover:bg-red-700 data-[loading]:bg-red-700",
        "disabled:bg-muted disabled:text-muted disabled:shadow-sm",
    ),
    "secondary-destructive": cx(
        "bg-surface text-red-600 ring-1 ring-red-300 ring-inset shadow-[0px_1px_2px_rgba(10,13,18,0.05)]",
        "hover:bg-red-50 hover:text-red-700 data-[loading]:bg-red-50",
        "disabled:opacity-50",
    ),
    "tertiary-destructive": cx(
        "text-red-600",
        "hover:bg-red-50 hover:text-red-700 data-[loading]:bg-red-50",
        "disabled:text-muted",
    ),
    "link-destructive": cx(
        "text-red-600",
        "hover:text-red-700",
        "disabled:text-muted",
    ),
};

export const Button = ({
    size = "sm",
    color = "primary",
    dark: _dark,
    children,
    className,
    noTextPadding,
    iconLeading: IconLeading,
    iconTrailing: IconTrailing,
    isDisabled: isDisabledProp,
    isLoading: loading,
    showTextWhileLoading,
    disabled: disabledProp,
    type = "button",
    ...props
}: ButtonProps) => {
    const disabled = isDisabledProp ?? disabledProp;
    const isLinkType = ["link-gray", "link-color", "link-destructive"].includes(color);
    const isIconOnly = (IconLeading || IconTrailing) && !children;

    return (
        <button
            type={type}
            data-loading={loading ? "" : undefined}
            disabled={disabled || loading}
            className={cx(
                "relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-none transition duration-100 ease-linear",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
                "disabled:cursor-not-allowed",
                sizeStyles[size],
                colorStyles[color],
                isIconOnly && "!p-2",
                isLinkType && "!rounded !p-0",
                loading && "pointer-events-none",
                loading && !showTextWhileLoading && "[&>*:not([data-loading-icon])]:invisible",
                className,
            )}
            {...props}
        >
            {isValidElement(IconLeading) && IconLeading}
            {isReactComponent(IconLeading) && <IconLeading className={iconCls} />}

            {loading && (
                <svg
                    fill="none"
                    data-loading-icon=""
                    viewBox="0 0 20 20"
                    className={cx(iconCls, !showTextWhileLoading && "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")}
                >
                    <circle className="stroke-current opacity-30" cx="10" cy="10" r="8" fill="none" strokeWidth="2" />
                    <circle className="origin-center animate-spin stroke-current" cx="10" cy="10" r="8" fill="none" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" />
                </svg>
            )}

            {children && (
                <span data-text="" className={cx("inline-flex items-center gap-1 transition-all duration-100", !noTextPadding && !isLinkType && "px-0.5")}>
                    {children}
                </span>
            )}

            {isValidElement(IconTrailing) && IconTrailing}
            {isReactComponent(IconTrailing) && <IconTrailing className={iconCls} />}
        </button>
    );
};
