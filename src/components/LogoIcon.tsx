import { cn } from "@/lib/utils";

interface LogoIconProps {
    className?: string;
    size?: number;
}

/**
 * MediMind brand logo — rounded square with a medical cross and pulse dot.
 * Uses `currentColor` for the background so it inherits from `text-primary` or
 * any other color utility. The cross and center dot are always white.
 */
const LogoIcon = ({ className, size = 32 }: LogoIconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={cn("flex-shrink-0", className)}
    >
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <rect x="13" y="7" width="6" height="18" rx="3" fill="white" />
        <rect x="7" y="13" width="18" height="6" rx="3" fill="white" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
);

export default LogoIcon;
