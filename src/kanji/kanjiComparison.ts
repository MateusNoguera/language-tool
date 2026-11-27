import type { ReferencePoint } from "./kanjiReference.js";

type Drawing = readonly (readonly ReferencePoint[])[];

type Segment = {
    start: ReferencePoint;
    end: ReferencePoint;
};

function getDrawingSegments(strokes: Drawing): Segment[] {
    const segments: Segment[] = [];

    for (const stroke of strokes) {
        for (let i = 0; i < stroke.length; i++) {
            segments.push({
                start: stroke[i],
                end: stroke[i + 1] ?? stroke[i]
            });
        }
    }

    return segments;
}

function pointToSegmentDistanceSquared(point: ReferencePoint, segment: Segment): number {
    const { start, end } = segment;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return (point.x - start.x) ** 2 + (point.y - start.y) ** 2;
    }

    const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
    const t = Math.max(0, Math.min(1, projection));

    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;

    return (point.x - closestX) ** 2 + (point.y - closestY) ** 2;
}

function averageDistanceToSegments(points: readonly ReferencePoint[], segments: readonly Segment[]): number {
    let total = 0;

    for (const point of points) {
        let nearestDistanceSquared = Infinity;

        for (const segment of segments) {
            const distanceSquared = pointToSegmentDistanceSquared(point, segment);
            nearestDistanceSquared = Math.min(nearestDistanceSquared, distanceSquared);
        }

        total += Math.sqrt(nearestDistanceSquared);
    }

    return total / points.length;
}

export function calculateShapeDistance(drawing: Drawing, reference: Drawing): number {
    const drawingPoints = drawing.flat();
    const referencePoints = reference.flat();

    if (drawingPoints.length === 0 || referencePoints.length === 0) {
        throw new Error("Cannot compare empty drawings.");
    }

    const drawingSegments = getDrawingSegments(drawing);
    const referenceSegments = getDrawingSegments(reference);

    const drawingToReference = averageDistanceToSegments(drawingPoints, referenceSegments);
    const referenceToDrawing = averageDistanceToSegments(referencePoints, drawingSegments);

    return (drawingToReference + referenceToDrawing) / 2;
}