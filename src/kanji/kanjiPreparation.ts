import type { ReferencePoint } from "./kanjiReference.js";
import { normalizeDrawingSpatially } from "./kanjiNormalization.js";
import { resampleDrawing } from "./kanjiResampling.js";

type Drawing = readonly (readonly ReferencePoint[])[];

export function prepareKanjiForComparison(strokes: Drawing): ReferencePoint[][] {
    const normalized = normalizeDrawingSpatially(strokes);
    return resampleDrawing(normalized);
}