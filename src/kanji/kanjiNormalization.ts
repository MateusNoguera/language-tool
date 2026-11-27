import type { ReferencePoint } from "./kanjiReference.js";

export type NormalizedBounds = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
};

export function normalizeDrawing(strokes: readonly (readonly ReferencePoint[])[], canvasSize: number): ReferencePoint[][] {
    if (!Number.isFinite(canvasSize) || canvasSize <= 0) {
        throw new Error("Invalid canvas size.");
    }

    return strokes.map(stroke =>
        stroke.map(point => ({
            x: point.x / canvasSize,
            y: point.y / canvasSize
        }))
    );
}

export function getDrawingBounds(strokes: readonly (readonly ReferencePoint[])[]): NormalizedBounds | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasPoints = false;

    for (const stroke of strokes) {
        for (const point of stroke) {
            if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
                throw new Error("Invalid drawing point.");
            }

            hasPoints = true;
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
    }

    if (!hasPoints) return null;

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export function normalizeDrawingSpatially(
    strokes: readonly (readonly ReferencePoint[])[],
    targetSize = 0.8
): ReferencePoint[][] {
    if (!Number.isFinite(targetSize) || targetSize <= 0 || targetSize > 1) {
        throw new Error("Invalid normalization target size.");
    }

    const bounds = getDrawingBounds(strokes);
    if (!bounds) return strokes.map(() => []);

    const maxDimension = Math.max(bounds.width, bounds.height);
    if (maxDimension === 0) {
        return strokes.map(stroke =>
            stroke.map(() => ({ x: 0.5, y: 0.5 }))
        );
    }

    const scale = targetSize / maxDimension;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    return strokes.map(stroke =>
        stroke.map(point => ({
            x: (point.x - centerX) * scale + 0.5,
            y: (point.y - centerY) * scale + 0.5
        }))
    );
}