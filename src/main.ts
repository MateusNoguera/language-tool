import { translations, type Language, type TranslationKey } from "./translations.js";

type Theme = "light" | "dark";

const themeButtons = document.querySelectorAll<HTMLButtonElement>(".ThemeOption");
const languageButtons = document.querySelectorAll<HTMLButtonElement>(".LanguageOption");

function updateThemeButtons(theme: Theme): void {
    themeButtons.forEach((button) => {
        const isActive = button.dataset.themeValue === theme;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function setTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("preferredTheme", theme);
    updateThemeButtons(theme);
    drawStrokes();
}

function updateLanguageButtons(language: Language): void {
    languageButtons.forEach((button) => {
        const isActive = button.dataset.langValue === language;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function isTranslationKey(key: string): key is TranslationKey {
    return Object.prototype.hasOwnProperty.call(translations["pt-BR"], key);
}

function setLanguage(language: Language): void {
    document.documentElement.lang = language;
    localStorage.setItem("preferredLanguage", language);

    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;

        if (!key || !isTranslationKey(key)) {
            console.warn(`Invalid translation key: ${key}`);
            return;
        }

        element.textContent = translations[language][key];
    });

    updateLanguageButtons(language);
}

const initialTheme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

const initialLanguage: Language = document.documentElement.lang === "en" ? "en" : "pt-BR";
updateThemeButtons(initialTheme);
setLanguage(initialLanguage);
document.documentElement.classList.add("i18n-ready");

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const themeValue = button.dataset.themeValue;

        if (themeValue === "light" || themeValue === "dark") {
            setTheme(themeValue);
        }
    });
});

languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const languageValue = button.dataset.langValue;

        if (languageValue === "pt-BR" || languageValue === "en") {
            setLanguage(languageValue);
        }
    });
});

type Point = {
    x: number;
    y: number;
};

type Stroke = Point[];

const strokes: Stroke[] = [];
let isDrawing: boolean = false;

const canvas = document.querySelector<HTMLCanvasElement>("#kanjiCanvas");
const ctx = canvas?.getContext("2d");

const CANVAS_SIZE = 400;

function resizeCanvas(): void {
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(
        canvas.width / CANVAS_SIZE,
        0,
        0,
        canvas.height / CANVAS_SIZE,
        0,
        0
    );

    drawStrokes();
}

function getCanvasPoint(event: PointerEvent): Point | null {
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return null;

    const x = (event.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_SIZE / rect.height);

    return {
        x: Math.max(0, Math.min(CANVAS_SIZE, x)),
        y: Math.max(0, Math.min(CANVAS_SIZE, y))
    };
}

function drawStrokes(): void {
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim();

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach((stroke) => {
        if (stroke.length === 0) return;

        ctx.beginPath();

        if (stroke.length === 1) {
            ctx.arc(stroke[0].x, stroke[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = textColor;
            ctx.fill();
            return;
        }

        ctx.moveTo(stroke[0].x, stroke[0].y);

        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }

        ctx.stroke();

    });
}

resizeCanvas();

if (canvas) {
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });

    resizeObserver.observe(canvas);
}

function startDrawing(event: PointerEvent): void {
    if (!canvas || event.button !== 0) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    isDrawing = true;
    strokes.push([point]);

    canvas.setPointerCapture(event.pointerId);
    drawStrokes();
}

function continueDrawing(event: PointerEvent): void {
    if (!isDrawing) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    const currentStroke = strokes[strokes.length - 1];
    if (!currentStroke) return;

    currentStroke.push(point);
    drawStrokes();
}

function stopDrawing(): void {
    isDrawing = false;
}

if (canvas) {
    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", continueDrawing);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    canvas.addEventListener("lostpointercapture", stopDrawing);
}