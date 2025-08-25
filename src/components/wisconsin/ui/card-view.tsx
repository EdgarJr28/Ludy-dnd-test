import { Card } from "../types/types";
import { COLOR_HEX, glyphSizeForCount, SHAPE_RENDERERS } from "./wcst-theme";


const LAYOUTS: Record<1 | 2 | 3 | 4, Array<{ top: number; left: number }>> = {
  1: [{ top: 50, left: 50 }],
  2: [{ top: 32, left: 32 }, { top: 68, left: 68 }],
  3: [{ top: 28, left: 30 }, { top: 28, left: 70 }, { top: 72, left: 50 }],
  4: [{ top: 30, left: 30 }, { top: 30, left: 70 }, { top: 70, left: 30 }, { top: 70, left: 70 }],
};

const ROTATION_BY_COUNT_INDEX: Record<number, number[]> = {
  1: [0],
  2: [0, 0],
  3: [0, 0, 0],
  4: [0, 0, 0, 0],
};

export function CardView({ card }: { card: Card }) {
  const color = COLOR_HEX[card.color];
  const Glyph = SHAPE_RENDERERS[card.shape];
  const size = glyphSizeForCount(card.count);

  const positions = LAYOUTS[Math.min(4, Math.max(1, card.count)) as 1 | 2 | 3 | 4];
  const rotations = ROTATION_BY_COUNT_INDEX[card.count] ?? ROTATION_BY_COUNT_INDEX[4];

  return (
    <div className="w-32 h-48  rounded-2xl border shadow-sm bg-white relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[11px] text-gray-400">#{card.id}</div>

      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            transform: `translate(-50%, -50%) rotate(${rotations[i] ?? 0}deg)`,
            filter: "drop-shadow(0 1.5px 1.5px rgba(0,0,0,0.25))",
          }}
        >
          <Glyph size={size} color={color} />
        </div>
      ))}

      <div className="w-full text-center absolute bottom-2 left-1/2 -translate-x-1/2 sm:text-[8px] text-[11px] text-gray-500 capitalize">
        {card.color} / {card.shape} / {card.count}
      </div>
    </div>
  );
}
