import type { LineResult } from "@/lib/hexagram/engine";

interface Props {
  lines: LineResult[];
  /** Render the transformed pattern (changing lines flipped). */
  transformed?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

/** Six lines, rendered top (line 6) to bottom (line 1). Changing lines are marked. */
export function HexagramFigure({ lines, transformed = false, size = "lg", className = "" }: Props) {
  const w = size === "lg" ? 160 : 64;
  const h = size === "lg" ? 14 : 6;
  const gap = size === "lg" ? 12 : 5;
  const gapMid = w * 0.18;
  const total = 6 * h + 5 * gap;

  return (
    <svg
      viewBox={`0 0 ${w + 30} ${total}`}
      width={w + 30}
      height={total}
      className={className}
      role="img"
      aria-label="Hexagram"
    >
      {[...lines].reverse().map((l, i) => {
        const yang = transformed && l.changing ? !l.yang : l.yang;
        const y = i * (h + gap);
        const fill = l.changing && !transformed ? "var(--accent)" : "var(--foreground)";
        return (
          <g key={l.position}>
            {yang ? (
              <rect x={0} y={y} width={w} height={h} fill={fill} rx={1} />
            ) : (
              <>
                <rect x={0} y={y} width={(w - gapMid) / 2} height={h} fill={fill} rx={1} />
                <rect
                  x={(w + gapMid) / 2}
                  y={y}
                  width={(w - gapMid) / 2}
                  height={h}
                  fill={fill}
                  rx={1}
                />
              </>
            )}
            {l.changing && !transformed && size === "lg" && (
              <text
                x={w + 10}
                y={y + h - 2}
                fontSize={12}
                fill="var(--accent)"
                fontFamily="var(--font-mono)"
              >
                {l.yang ? "○" : "×"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
