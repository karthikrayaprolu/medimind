"use client";

import React, { useEffect, useRef } from "react";
import { createSwapy, SlotItemMap, SwapEventHandler } from "swapy";
import { cn } from "@/lib/utils";

// SwapyLayout Component - Main container that initializes Swapy
interface SwapyLayoutProps {
    id: string;
    className?: string;
    children: React.ReactNode;
    config?: {
        animation?: "dynamic" | "spring" | "none";
        swapMode?: "drop" | "hover";
        enabled?: boolean;
        continuousMode?: boolean;
    };
    onSwap?: SwapEventHandler;
}

export const SwapyLayout: React.FC<SwapyLayoutProps> = ({
    id,
    className,
    children,
    config,
    onSwap,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const swapyInstanceRef = useRef<ReturnType<typeof createSwapy> | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Swapy
        swapyInstanceRef.current = createSwapy(containerRef.current, config);

        // Attach event listener
        if (onSwap) {
            swapyInstanceRef.current.onSwap(onSwap);
        }

        // Cleanup
        return () => {
            swapyInstanceRef.current?.destroy();
        };
    }, [config, onSwap]);

    return (
        <div ref={containerRef} id={id} className={cn(className)}>
            {children}
        </div>
    );
};

// SwapySlot Component - Defines droppable areas
interface SwapySlotProps {
    id: string;
    className?: string;
    children: React.ReactNode;
}

export const SwapySlot: React.FC<SwapySlotProps> = ({
    id,
    className,
    children,
}) => {
    return (
        <div data-swapy-slot={id} className={cn(className)}>
            {children}
        </div>
    );
};

// SwapyItem Component - Defines draggable items
interface SwapyItemProps {
    id: string;
    className?: string;
    children: React.ReactNode;
}

export const SwapyItem: React.FC<SwapyItemProps> = ({
    id,
    className,
    children,
}) => {
    return (
        <div data-swapy-item={id} className={cn(className)}>
            {children}
        </div>
    );
};

// DragHandle Component - Optional handle for dragging
interface DragHandleProps {
    className?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({ className }) => {
    return (
        <div
            data-swapy-handle
            className={cn(
                "absolute top-2 right-2 cursor-grab active:cursor-grabbing",
                "w-8 h-8 flex items-center justify-center",
                "bg-white/80 rounded-md shadow-sm hover:bg-white transition-colors",
                "z-20",
                className
            )}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                <circle cx="12" cy="4" r="1.5" fill="currentColor" />
                <circle cx="4" cy="8" r="1.5" fill="currentColor" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
        </div>
    );
};
