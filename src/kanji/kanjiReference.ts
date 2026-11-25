export type ReferencePoint = {
    x: number;
    y: number;
};

export type KanjiReference = {
    kanjiId: string;
    character: string;
    strokes: ReferencePoint[][];
};