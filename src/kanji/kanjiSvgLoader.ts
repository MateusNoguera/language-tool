export type KanjiSvgStroke = {
    order: number;
    pathData: string;
};

export type KanjiSvgData = {
    viewBox: string;
    strokes: KanjiSvgStroke[];
};

export async function loadKanjiSvg(filePath: string): Promise<KanjiSvgData> {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Failed to load Kanji SVG: ${response.status}`);
    }

    const svgText = await response.text();
    const document = new DOMParser().parseFromString(svgText, "image/svg+xml");

    if (document.querySelector("parsererror")) {
        throw new Error("Invalid Kanji SVG.");
    }

    const svg = document.documentElement;
    const strokeGroup = svg.querySelector('g[id^="kvg:StrokePaths_"]');
    const viewBox = svg.getAttribute("viewBox");

    if (!strokeGroup || !viewBox) {
        throw new Error("Invalid KanjiVG structure.");
    }

    const paths = strokeGroup.querySelectorAll("path");
    const strokes: KanjiSvgStroke[] = [];

    paths.forEach((path) => {
        const id = path.getAttribute("id") ?? "";
        const pathData = path.getAttribute("d");
        const match = id.match(/-s(\d+)$/);

        if (!match || !pathData) {
            throw new Error(`Invalid KanjiVG stroke: ${id}`);
        }

        strokes.push({
            order: Number(match[1]),
            pathData
        });
    });

    if (strokes.length === 0) {
        throw new Error("KanjiVG contains no strokes.");
    }

    strokes.sort((a, b) => a.order - b.order);

    return { viewBox, strokes };
}