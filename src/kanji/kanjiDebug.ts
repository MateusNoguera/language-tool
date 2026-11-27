import type { ReferencePoint } from "./kanjiReference.js";

export function drawKanjiReference(
    canvas: HTMLCanvasElement,
    strokes: ReferencePoint[][]
): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach((stroke) => {
        if (stroke.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(stroke[0].x * width, stroke[0].y * height);

        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x * width, stroke[i].y * height);
        }

        if (stroke.length === 1) {
            ctx.lineTo(stroke[0].x * width, stroke[0].y * height);
        }

        ctx.stroke();
    });
}