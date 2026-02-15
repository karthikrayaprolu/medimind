import { cn } from "@/lib/utils";

interface AvatarProps {
    className?: string;
}

// ── Men Avatars ──

export const AvatarM1 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        {/* Background */}
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        {/* Neck */}
        <rect x="32" y="52" width="16" height="8" rx="3" fill="#D4A574" />
        {/* Face */}
        <circle cx="40" cy="36" r="16" fill="#E8C4A0" />
        {/* Hair - short neat */}
        <path d="M24 30c0-9 7-16 16-16s16 7 16 16c0 2-0.3 3-1 4 0-8-6.5-15-15-15s-15 7-15 15c-0.7-1-1-2-1-4z" fill="#4A3728" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        {/* Eye shine */}
        <circle cx="34.8" cy="35.2" r="0.8" fill="white" />
        <circle cx="46.8" cy="35.2" r="0.8" fill="white" />
        {/* Eyebrows */}
        <path d="M30 32c1-2 3-3 5-2.5" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M50 32c-1-2-3-3-5-2.5" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Nose */}
        <path d="M40 38v4" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
        {/* Smile */}
        <path d="M35 45c2 3 8 3 10 0" stroke="#C4956A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        {/* Shirt */}
        <path d="M20 68c0-10 9-16 20-16s20 6 20 16" fill="hsl(var(--primary))" />
        <path d="M20 68c0-10 9-16 20-16s20 6 20 16" fill="hsl(var(--primary))" opacity="0.9" />
        {/* Collar */}
        <path d="M36 54l4 6 4-6" stroke="hsl(var(--primary))" strokeWidth="2" fill="hsl(var(--primary) / 0.7)" />
    </svg>
);

export const AvatarM2 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="32" y="52" width="16" height="8" rx="3" fill="#C4956A" />
        <circle cx="40" cy="36" r="16" fill="#D4A574" />
        {/* Hair - buzz cut */}
        <path d="M24 32c0-10 7-18 16-18s16 8 16 18c0 1-0.2 2-0.5 3-0.5-9-7-16-15.5-16s-15 7-15.5 16c-0.3-1-0.5-2-0.5-3z" fill="#1A1A1A" />
        {/* Glasses */}
        <rect x="28" y="32" width="10" height="8" rx="4" stroke="#555" strokeWidth="1.5" fill="none" />
        <rect x="42" y="32" width="10" height="8" rx="4" stroke="#555" strokeWidth="1.5" fill="none" />
        <line x1="38" y1="36" x2="42" y2="36" stroke="#555" strokeWidth="1.2" />
        {/* Eyes behind glasses */}
        <ellipse cx="33" cy="36" rx="1.5" ry="2" fill="#2C1810" />
        <ellipse cx="47" cy="36" rx="1.5" ry="2" fill="#2C1810" />
        <circle cx="33.6" cy="35.3" r="0.6" fill="white" />
        <circle cx="47.6" cy="35.3" r="0.6" fill="white" />
        <path d="M40 39v3.5" stroke="#C4956A" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M35 46c2 2.5 8 2.5 10 0" stroke="#B0805A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Shirt with tie */}
        <path d="M20 68c0-10 9-16 20-16s20 6 20 16" fill="#2C3E50" />
        <path d="M40 52v14" stroke="#E74C3C" strokeWidth="3" />
        <path d="M38 52l2 3 2-3" fill="#E74C3C" />
    </svg>
);

export const AvatarM3 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="32" y="52" width="16" height="8" rx="3" fill="#8D6E4C" />
        <circle cx="40" cy="36" r="16" fill="#A0784C" />
        {/* Hair - curly top */}
        <path d="M26 28c-1-8 6-16 14-16s15 8 14 16" fill="#2C1810" />
        <circle cx="28" cy="25" r="3" fill="#2C1810" />
        <circle cx="34" cy="21" r="3.5" fill="#2C1810" />
        <circle cx="40" cy="19" r="3.5" fill="#2C1810" />
        <circle cx="46" cy="21" r="3.5" fill="#2C1810" />
        <circle cx="52" cy="25" r="3" fill="#2C1810" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#1A0E08" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#1A0E08" />
        <circle cx="34.8" cy="35.2" r="0.8" fill="white" />
        <circle cx="46.8" cy="35.2" r="0.8" fill="white" />
        <path d="M30 33c1.5-1.5 3-2 5-1.5" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M50 33c-1.5-1.5-3-2-5-1.5" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M40 38.5v3.5" stroke="#8D6E4C" strokeWidth="1.3" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M34 45c2.5 3.5 9.5 3.5 12 0" stroke="#7A5C3C" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        {/* Hoodie */}
        <path d="M20 68c0-10 9-16 20-16s20 6 20 16" fill="#27AE60" />
        <path d="M35 54c2 4 8 4 10 0" stroke="#219A52" strokeWidth="1.5" fill="none" />
    </svg>
);

export const AvatarM4 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="32" y="52" width="16" height="8" rx="3" fill="#E8C4A0" />
        <circle cx="40" cy="36" r="16" fill="#F5DCC0" />
        {/* Hair - side part */}
        <path d="M24 30c0-9 7-16 16-16s16 7 16 16c0 1.5-0.2 2.5-0.8 3.5 0-8-6.5-14-15.2-14s-15.2 6-15.2 14c-0.6-1-0.8-2-0.8-3.5z" fill="#8B7355" />
        <path d="M24 30c1-4 4-6 7-6 2 0 3 1.5 3 3.5" fill="#8B7355" />
        {/* Beard */}
        <path d="M28 42c0 7 5 12 12 12s12-5 12-12" fill="#8B7355" opacity="0.3" />
        <path d="M30 44c0 5 4 9 10 9s10-4 10-9" fill="none" stroke="#8B7355" strokeWidth="1" />
        {/* Eyes */}
        <ellipse cx="34" cy="35" rx="1.8" ry="2.2" fill="#2C1810" />
        <ellipse cx="46" cy="35" rx="1.8" ry="2.2" fill="#2C1810" />
        <circle cx="34.6" cy="34.4" r="0.6" fill="white" />
        <circle cx="46.6" cy="34.4" r="0.6" fill="white" />
        <path d="M40 38v3" stroke="#E0B088" strokeWidth="1.3" strokeLinecap="round" />
        {/* Shirt */}
        <path d="M20 68c0-10 9-16 20-16s20 6 20 16" fill="#3498DB" />
        <path d="M32 56h16" stroke="#2980B9" strokeWidth="1" />
    </svg>
);

// ── Women Avatars ──

export const AvatarW1 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="33" y="52" width="14" height="7" rx="3" fill="#E8C4A0" />
        <circle cx="40" cy="36" r="15" fill="#F5DCC0" />
        {/* Long straight hair */}
        <path d="M22 32c0-11 8-19 18-19s18 8 18 19c0 3-0.5 5-1.5 7-0.5-12-7.5-20-16.5-20s-16 8-16.5 20c-1-2-1.5-4-1.5-7z" fill="#4A2810" />
        <path d="M22 32c0 8 1 16 2 22" stroke="#4A2810" strokeWidth="6" strokeLinecap="round" />
        <path d="M58 32c0 8-1 16-2 22" stroke="#4A2810" strokeWidth="6" strokeLinecap="round" />
        {/* Eyes with lashes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <circle cx="34.7" cy="35" r="0.8" fill="white" />
        <circle cx="46.7" cy="35" r="0.8" fill="white" />
        <path d="M30 33.5c1.5-1 3.5-1.2 5.5-0.5" stroke="#4A2810" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M50 33.5c-1.5-1-3.5-1.2-5.5-0.5" stroke="#4A2810" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <circle cx="30" cy="40" r="3" fill="#F5A0A0" opacity="0.2" />
        <circle cx="50" cy="40" r="3" fill="#F5A0A0" opacity="0.2" />
        <path d="M40 38v3" stroke="#E0B088" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M36 45c1.5 2.5 6.5 2.5 8 0" stroke="#D4956A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Top */}
        <path d="M20 68c0-9 9-15 20-15s20 6 20 15" fill="#E91E63" />
        <path d="M36 54c1.5 3 6.5 3 8 0" stroke="#C2185B" strokeWidth="1.2" fill="none" />
    </svg>
);

export const AvatarW2 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="33" y="52" width="14" height="7" rx="3" fill="#D4A574" />
        <circle cx="40" cy="36" r="15" fill="#E8C4A0" />
        {/* Bob hair */}
        <path d="M22 30c0-10 8-18 18-18s18 8 18 18c0 4-1 7-2.5 10 0-10-7-18-15.5-18s-15.5 8-15.5 18c-1.5-3-2.5-6-2.5-10z" fill="#1A0A00" />
        <path d="M22 30c-0.5 5 0 10 1 14" stroke="#1A0A00" strokeWidth="5" strokeLinecap="round" />
        <path d="M58 30c0.5 5 0 10-1 14" stroke="#1A0A00" strokeWidth="5" strokeLinecap="round" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <circle cx="34.7" cy="35" r="0.7" fill="white" />
        <circle cx="46.7" cy="35" r="0.7" fill="white" />
        {/* Blush */}
        <circle cx="30" cy="40" r="2.5" fill="#F5A0A0" opacity="0.2" />
        <circle cx="50" cy="40" r="2.5" fill="#F5A0A0" opacity="0.2" />
        <path d="M40 38v3" stroke="#C4956A" strokeWidth="1.2" strokeLinecap="round" />
        {/* Lipstick smile */}
        <path d="M36 45c1.5 2.5 6.5 2.5 8 0" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Earrings */}
        <circle cx="24" cy="40" r="1.5" fill="hsl(var(--primary))" />
        <circle cx="56" cy="40" r="1.5" fill="hsl(var(--primary))" />
        {/* Blazer */}
        <path d="M20 68c0-9 9-15 20-15s20 6 20 15" fill="#2C3E50" />
        <path d="M40 53v6" stroke="white" strokeWidth="1.5" />
    </svg>
);

export const AvatarW3 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="33" y="52" width="14" height="7" rx="3" fill="#A0784C" />
        <circle cx="40" cy="36" r="15" fill="#B8905C" />
        {/* Ponytail / bun hair */}
        <path d="M23 30c0-10 7.5-18 17-18s17 8 17 18c0 3-0.5 5-1.5 7-0.5-10-7-17-15.5-17s-15 7-15.5 17c-1-2-1.5-4-1.5-7z" fill="#2C1810" />
        {/* Hair bun on top */}
        <circle cx="40" cy="14" r="6" fill="#2C1810" />
        <path d="M34 16c2-3 10-3 12 0" fill="#2C1810" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#1A0E08" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#1A0E08" />
        <circle cx="34.7" cy="35" r="0.8" fill="white" />
        <circle cx="46.7" cy="35" r="0.8" fill="white" />
        {/* Blush */}
        <circle cx="30.5" cy="40" r="2.5" fill="#F5A0A0" opacity="0.25" />
        <circle cx="49.5" cy="40" r="2.5" fill="#F5A0A0" opacity="0.25" />
        <path d="M40 38.5v3" stroke="#9A7044" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M35.5 45c2 2.5 7 2.5 9 0" stroke="#8A6034" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Scrubs / medical top */}
        <path d="M20 68c0-9 9-15 20-15s20 6 20 15" fill="#00ACC1" />
        <path d="M36 54c1.5 3 6.5 3 8 0" stroke="#00838F" strokeWidth="1.2" fill="none" />
    </svg>
);

export const AvatarW4 = ({ className }: AvatarProps) => (
    <svg viewBox="0 0 80 80" fill="none" className={cn("w-full h-full", className)}>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--primary) / 0.08)" />
        <rect x="33" y="52" width="14" height="7" rx="3" fill="#F5DCC0" />
        <circle cx="40" cy="36" r="15" fill="#FDE8D0" />
        {/* Wavy / curly shoulder hair */}
        <path d="M22 30c0-10 8-18 18-18s18 8 18 18c0 4-1 7-2.5 10 0-10-7-18-15.5-18s-15.5 8-15.5 18c-1.5-3-2.5-6-2.5-10z" fill="#C87137" />
        <path d="M22 30c0 7 0.5 14 2 20" stroke="#C87137" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M58 30c0 7-0.5 14-2 20" stroke="#C87137" strokeWidth="5.5" strokeLinecap="round" />
        {/* Cute wavy detail */}
        <path d="M20 42c1 4 2 6 4 8" stroke="#C87137" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M60 42c-1 4-2 6-4 8" stroke="#C87137" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Eyes */}
        <ellipse cx="34" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <ellipse cx="46" cy="36" rx="2" ry="2.5" fill="#2C1810" />
        <circle cx="34.7" cy="35" r="0.7" fill="white" />
        <circle cx="46.7" cy="35" r="0.7" fill="white" />
        {/* Freckles */}
        <circle cx="32" cy="40" r="0.6" fill="#D4956A" opacity="0.4" />
        <circle cx="34" cy="41" r="0.6" fill="#D4956A" opacity="0.4" />
        <circle cx="46" cy="41" r="0.6" fill="#D4956A" opacity="0.4" />
        <circle cx="48" cy="40" r="0.6" fill="#D4956A" opacity="0.4" />
        {/* Blush */}
        <circle cx="30.5" cy="40" r="2.5" fill="#F5A0A0" opacity="0.15" />
        <circle cx="49.5" cy="40" r="2.5" fill="#F5A0A0" opacity="0.15" />
        <path d="M40 38v3" stroke="#E8C4A0" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M36 45c1.5 2 6.5 2 8 0" stroke="#D4A574" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Cardigan */}
        <path d="M20 68c0-9 9-15 20-15s20 6 20 15" fill="#9B59B6" />
        <path d="M40 53v14" stroke="#8E44AD" strokeWidth="1.5" />
    </svg>
);

// ── Avatar Map ──

const avatarComponents: Record<string, React.FC<AvatarProps>> = {
    m1: AvatarM1,
    m2: AvatarM2,
    m3: AvatarM3,
    m4: AvatarM4,
    w1: AvatarW1,
    w2: AvatarW2,
    w3: AvatarW3,
    w4: AvatarW4,
};

interface ProfileAvatarProps {
    avatarId: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const ProfileAvatar = ({ avatarId, size = "md", className }: ProfileAvatarProps) => {
    const AvatarComponent = avatarComponents[avatarId] || AvatarM1;
    const sizeClasses = {
        sm: "w-7 h-7",
        md: "w-12 h-12",
        lg: "w-20 h-20",
    };

    return (
        <div className={cn(sizeClasses[size], "rounded-full overflow-hidden", className)}>
            <AvatarComponent />
        </div>
    );
};

export const avatarIds = ["m1", "m2", "m3", "m4", "w1", "w2", "w3", "w4"] as const;
export type AvatarId = (typeof avatarIds)[number];

export default ProfileAvatar;
