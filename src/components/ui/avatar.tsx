import { useState, type FC, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export type AvatarSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps {
    size?: AvatarSize;
    className?: string;
    src?: string | null;
    alt?: string;
    /** Display a contrast border around the avatar */
    contrastBorder?: boolean;
    /** Online/offline status indicator */
    status?: "online" | "offline";
    /** Display a verified tick */
    verified?: boolean;
    /** Initials to display when no image is available */
    initials?: string;
    /** Name to auto-derive initials from (convenience prop) */
    name?: string | null;
    /** Palette index for colorful initials backgrounds */
    index?: number;
    /** Dark mode */
    dark?: boolean;
    /** Placeholder icon component */
    placeholderIcon?: FC<{ className?: string }>;
    /** Placeholder content */
    placeholder?: ReactNode;
}

const sizeStyles: Record<AvatarSize, { root: string; text: string; icon: string }> = {
    xxs: { root: "w-4 h-4",   text: "text-[9px] font-semibold",    icon: "w-3 h-3" },
    xs:  { root: "w-6 h-6",   text: "text-xs font-semibold",       icon: "w-4 h-4" },
    sm:  { root: "w-8 h-8",   text: "text-sm font-semibold",       icon: "w-5 h-5" },
    md:  { root: "w-10 h-10", text: "text-base font-semibold",     icon: "w-6 h-6" },
    lg:  { root: "w-12 h-12", text: "text-lg font-semibold",       icon: "w-7 h-7" },
    xl:  { root: "w-14 h-14", text: "text-xl font-semibold",       icon: "w-8 h-8" },
    "2xl": { root: "w-16 h-16", text: "text-2xl font-semibold",    icon: "w-8 h-8" },
};

// Colorful palette for named avatars
const palette = [
    { light: "bg-green-100 text-green-700", dark: "bg-green-900 text-green-300" },
    { light: "bg-blue-100 text-blue-700",   dark: "bg-blue-900 text-blue-300" },
    { light: "bg-pink-100 text-pink-700",   dark: "bg-pink-900 text-pink-300" },
    { light: "bg-teal-100 text-teal-700",   dark: "bg-teal-900 text-teal-300" },
];

function deriveInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export const Avatar = ({
    size = "sm",
    src,
    alt,
    initials,
    name,
    index = 0,
    dark = false,
    contrastBorder = true,
    status,
    className,
    placeholderIcon: PlaceholderIcon,
    placeholder,
}: AvatarProps) => {
    const [imgFailed, setImgFailed] = useState(false);
    const s = sizeStyles[size];
    const p = palette[index % palette.length];
    const derivedInitials = initials ?? (name ? deriveInitials(name) : null);

    const renderContent = () => {
        if (src && !imgFailed) {
            return (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full rounded-full object-cover"
                />
            );
        }
        if (derivedInitials) {
            return <span className={cx(s.text, dark ? p.dark : p.light, "w-full h-full rounded-full flex items-center justify-center")}>{derivedInitials}</span>;
        }
        if (PlaceholderIcon) {
            return <PlaceholderIcon className={cx(s.icon, dark ? "text-gray-400" : "text-gray-400")} />;
        }
        if (placeholder) return placeholder;
        // Fallback: "?" for null/undefined name
        return (
            <span className={cx(s.text, dark ? "text-gray-400" : "text-gray-400")}>?</span>
        );
    };

    const bgColor = (src && !imgFailed) || derivedInitials
        ? ""
        : (dark ? "bg-gray-700" : "bg-gray-100");

    return (
        <div
            data-avatar=""
            className={cx(
                "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden",
                s.root,
                bgColor,
                contrastBorder && (dark ? "ring-2 ring-gray-800" : "ring-2 ring-white"),
                className,
            )}
        >
            {renderContent()}
            {status && (
                <span
                    className={cx(
                        "absolute right-0 bottom-0 rounded-full",
                        size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3 h-3",
                        status === "online" ? "bg-emerald-500" : "bg-gray-300",
                        dark ? "ring-[1.5px] ring-gray-900" : "ring-[1.5px] ring-white",
                    )}
                />
            )}
        </div>
    );
};
