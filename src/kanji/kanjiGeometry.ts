import type { ReferencePoint } from "./kanjiReference.js";
import type { KanjiSvgData } from "./kanjiSvgLoader.js";

export function convertKanjiSvgToPoints(data: KanjiSvgData): ReferencePoint[][] {
    const values = data.viewBox.trim().split(/[\s,]+/).map(Number);

    if (values.length !== 4 || values.some(value => !Number.isFinite(value))) {
        throw new Error("Invalid Kanji SVG viewBox.");
    }

    const [minX, minY, width, height] = values;

    if (width <= 0 || height <= 0) {
        throw new Error("Invalid Kanji SVG dimensions.");
    }

    const spacing = Math.min(width, height) / 50;

    return data.strokes.map((stroke) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", stroke.pathData);

        const length = path.getTotalLength();

        if (!Number.isFinite(length)) {
            throw new Error(`Invalid geometry for stroke ${stroke.order}.`);
        }

        const segments = Math.max(1, Math.ceil(length / spacing));
        const points: ReferencePoint[] = [];

        for (let i = 0; i <= segments; i++) {
            const position = path.getPointAtLength(length * i / segments);

            points.push({
                x: (position.x - minX) / width,
                y: (position.y - minY) / height
            });
        }

        return points;
    });
}