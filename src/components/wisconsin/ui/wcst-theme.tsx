// theme/wcst-theme.tsx
import React from "react";
import type { Color, Shape } from "../types/types";
import type { JSX } from "react";

/** Paleta */
export const COLOR_HEX: Record<Color, string> = {
    red: "#dc2626",
    green: "#16a34a",
    blue: "#2563eb",
    yellow: "#ca8a04",
};

/** Tamaño más grande por cantidad (da “cuerpo”) */
export function glyphSizeForCount(count: number) {
    if (count === 1) return 80;
    if (count === 2) return 60;
    if (count === 3) return 54;
    return 48; // 4
}

/** ✅ Todos los SVGs son **rellenos** (no hay strokes) */
/** ✅ cross = **+** sólido, no X */
export const SHAPE_RENDERERS: Record<
    Shape,
    (opts: { size?: number; color: string }) => JSX.Element
> = {
    circle: ({ size = 28, color }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" fill={color} />
        </svg>
    ),
    triangle: ({ size = 28, color }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <polygon points="12,4 20,20 4,20" fill={color} />
        </svg>
    ),
    // PLUS sólido (cruz) con brazos gruesos
    cross: ({ size = 28, color }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            {/* un solo path que dibuja un + sólido */}
            <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill={color} />
        </svg>
    ),
    star: ({ size = 28, color }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 14.17l-5-4.9 6.91-1.01L12 2z"
                fill={color}
            />
        </svg>
    ),
};