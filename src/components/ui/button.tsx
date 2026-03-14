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

function colorStyle(color: ButtonColor, dark: boolean): string {
    switch (color) {
        case "primary":
            return cx(
                "bg-[#00B369] text-white ring-1 ring-transparent ring-inset",
                SHADOW_SKEU,
                "hover:bg-[#00975B] data-[loading]:bg-[#00975B]",
                "disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-sm disabled:ring-gray-200",
            );
        case "secondary":
            return dark
                ? cx(
                    "bg-gray-800 text-gray-200 ring-1 ring-gray-700 ring-inset",
                    "shadow-[0px_1px_2px_rgba(10,13,18,0.05)]",
                    "hover:bg-gray-700 hover:text-white data-[loading]:bg-gray-700",
                    "disabled:bg-gray-900 disabled:text-gray-600 disabled:ring-gray-800",
                  )
                : cx(
                    "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset",
                    SHADOW_SKEU,
                    "hover:bg-gray-50 hover:text-gray-800 data-[loading]:bg-gray-50",
                    "disabled:bg-gray-50 disabled:text-gray-400 disabled:ring-gray-200",
                  );
        case "tertiary":
            return dark
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray-300 data-[loading]:bg-gray-800 disabled:text-gray-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-700 data-[loading]:bg-gray-50 disabled:text-gray-400";
        case "link-gray":
            return dark
                ? "text-gray-400 hover:text-gray-300 disabled:text-gray-600"
                : "text-gray-600 hover:text-gray-700 disabled:text-gray-400";
        case "link-color":
            return "text-[#00975B] hover:text-[#00B369] disabled:text-gray-400";
        case "primary-destructive":
            return cx(
                "bg-red-600 text-white ring-1 ring-transparent ring-inset",
                SHADOW_SKEU,
                "hover:bg-red-700 data-[loading]:bg-red-700",
                "disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-sm disabled:ring-gray-200",
            );
        case "secondary-destructive":
            return cx(
                dark
                    ? "bg-gray-800 text-red-400 ring-1 ring-red-800 ring-inset hover:bg-red-950 hover:text-red-300 data-[loading]:bg-red-950"
                    : "bg-white text-red-600 ring-1 ring-red-300 ring-inset shadow-[0px_1px_2px_rgba(10,13,18,0.05)] hover:bg-red-50 hover:text-red-700 data-[loading]:bg-red-50",
                "disabled:opacity-50",
            );
        case "tertiary-destructive":
            return dark
                ? "text-red-400 hover:bg-red-950 hover:text-red-300 data-[loading]:bg-red-950 disabled:text-gray-600"
                : "text-red-600 hover:bg-red-50 hover:text-red-700 data-[loading]:bg-red-50 disabled:text-gray-400";
        case "link-destructive":
            return dark
                ? "text-red-400 hover:text-red-300 disabled:text-gray-600"
                : "text-red-600 hover:text-red-700 disabled:text-gray-400";
        default:
            return "";
    }
}

export const Button = ({
    size = "sm",
    color = "primary",
    dark = false,
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
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B369]",
                "disabled:cursor-not-allowed",
                sizeStyles[size],
                colorStyle(color, dark),
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
                <span data-text="" className={cx("transition-all duration-100", !noTextPadding && !isLinkType && "px-0.5")}>
                    {children}
                </span>
            )}

            {isValidElement(IconTrailing) && IconTrailing}
            {isReactComponent(IconTrailing) && <IconTrailing className={iconCls} />}
        </button>
    );
};
