import type { ReferencePoint } from "./kanjiReference.js";

export function resampleStroke(stroke: readonly ReferencePoint[], spacing = 0.01): ReferencePoint[] {
    if (!Number.isFinite(spacing) || spacing <= 0) {
        throw new Error("Invalid resampling spacing.");
    }

    if (stroke.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
        throw new Error("Invalid stroke point.");
    }

    if (stroke.length === 0) return [];
    if (stroke.length === 1) return [{ ...stroke[0] }];

    const distances = [0];

    for (let i = 1; i < stroke.length; i++) {
        const previous = stroke[i - 1];
        const current = stroke[i];
        const distance = Math.hypot(current.x - previous.x, current.y - previous.y);

        distances.push(distances[i - 1] + distance);
    }

    const totalLength = distances[distances.length - 1];

    if (totalLength === 0) return [{ ...stroke[0] }];

    const segmentCount = Math.max(1, Math.ceil(totalLength / spacing));
    const result: ReferencePoint[] = [];

    let segmentIndex = 1;

    for (let i = 0; i <= segmentCount; i++) {
        const targetDistance = totalLength * i / segmentCount;

        while (segmentIndex < distances.length - 1 && distances[segmentIndex] < targetDistance) {
            segmentIndex++;
        }

        const start = stroke[segmentIndex - 1];
        const end = stroke[segmentIndex];
        const segmentStart = distances[segmentIndex - 1];
        const segmentLength = distances[segmentIndex] - segmentStart;

        const t = segmentLength === 0 ? 0 : (targetDistance - segmentStart) / segmentLength;

        result.push({
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
        });
    }

    return result;
}

export function resampleDrawing(
    strokes: readonly (readonly ReferencePoint[])[],
    spacing = 0.01
): ReferencePoint[][] {
    return strokes.map(stroke => resampleStroke(stroke, spacing));
}