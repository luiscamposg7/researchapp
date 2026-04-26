import { useState, type FC, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export type AvatarSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps {
    size?: AvatarSize;
    className?: string;
    src?: string | null;
    alt?: string;
    contrastBorder?: boolean;
    status?: "online" | "offline";
    verified?: boolean;
    initials?: string;
    /** Name to auto-derive initials from */
    name?: string | null;
    /** Palette index for colorful initials backgrounds */
    index?: number;
    /** @deprecated handled automatically via CSS tokens */
    dark?: boolean;
    placeholderIcon?: FC<{ className?: string }>;
    placeholder?: ReactNode;
}

const sizeStyles: Record<AvatarSize, { root: string; text: string; icon: string }> = {
    xxs: { root: "w-4 h-4",   text: "text-[9px] font-semibold",  icon: "w-3 h-3" },
    xs:  { root: "w-6 h-6",   text: "text-xs font-semibold",     icon: "w-4 h-4" },
    sm:  { root: "w-8 h-8",   text: "text-sm font-semibold",     icon: "w-5 h-5" },
    md:  { root: "w-10 h-10", text: "text-base font-semibold",   icon: "w-6 h-6" },
    lg:  { root: "w-12 h-12", text: "text-lg font-semibold",     icon: "w-7 h-7" },
    xl:  { root: "w-14 h-14", text: "text-xl font-semibold",     icon: "w-8 h-8" },
    "2xl": { root: "w-16 h-16", text: "text-2xl font-semibold",  icon: "w-8 h-8" },
};

// Colorful palette for named avatars
const palette = [
    "avatar-green",
    "avatar-blue",
    "avatar-violet",
    "avatar-amber",
    "avatar-pink",
    "avatar-teal",
    "avatar-orange",
    "avatar-indigo",
];

function deriveInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function nameToIndex(name: string, len: number): number {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i) * (i + 1);
    return sum % len;
}

export const Avatar = ({
    size = "sm",
    src,
    alt,
    initials,
    name,
    index = 0,
    contrastBorder = true,
    status,
    className,
    placeholderIcon: PlaceholderIcon,
    placeholder,
}: AvatarProps) => {
    const [imgFailed, setImgFailed] = useState(false);
    const s = sizeStyles[size];
    const derivedInitials = initials ?? (name ? deriveInitials(name) : null);

    const renderContent = () => {
        if (src && !imgFailed) {
            return (
                <img src={src} alt={alt} onError={() => setImgFailed(true)} className="w-full h-full rounded-full object-cover" />
            );
        }
        if (derivedInitials) {
            return (
                <div className={cx("w-full h-full rounded-full flex items-center justify-center", palette[name ? nameToIndex(name, palette.length) : index % palette.length])}>
                    <span className={s.text}>{derivedInitials}</span>
                </div>
            );
        }
        if (PlaceholderIcon) return <PlaceholderIcon className={cx(s.icon, "text-muted")} />;
        if (placeholder) return placeholder;
        return <span className={cx(s.text, "text-muted")}>?</span>;
    };

    return (
        <div
            data-avatar=""
            className={cx(
                "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-muted",
                s.root,
                contrastBorder && "ring-2 ring-surface",
                className,
            )}
        >
            {renderContent()}
            {status && (
                <span className={cx(
                    "absolute right-0 bottom-0 rounded-full ring-[1.5px] ring-surface",
                    size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3 h-3",
                    status === "online" ? "bg-emerald-500" : "bg-gray-300",
                )} />
            )}
        </div>
    );
};
