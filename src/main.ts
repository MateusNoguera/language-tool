import { translations, type Language, type TranslationKey } from "./translations.js";

type Theme = "light" | "dark";
type GridMode = "none" | "four" | "sixteen" | "diagonal";

const themeButtons = document.querySelectorAll<HTMLButtonElement>(".ThemeOption");
const languageButtons = document.querySelectorAll<HTMLButtonElement>(".LanguageOption");
const gridOptions = document.querySelectorAll<HTMLInputElement>('input[name="gridMode"]');
const canvasContainer = document.querySelector<HTMLElement>(".CanvasContainer");

const settingsButton = document.querySelector<HTMLButtonElement>("#settingsButton");
const settingsCloseButton = document.querySelector<HTMLButtonElement>("#settingsCloseButton");
const settingsPanel = document.querySelector<HTMLDialogElement>("#settingsPanel");

const undoButton = document.querySelector<HTMLButtonElement>("#undoButton");
const redoButton = document.querySelector<HTMLButtonElement>("#redoButton");

function isGridMode(value: string): value is GridMode {
    return value === "none" || value === "four" || value === "sixteen" || value === "diagonal";
}

function setGridMode(mode: GridMode): void {
    localStorage.setItem("preferredGridMode", mode);

    if (canvasContainer) canvasContainer.dataset.gridMode = mode;

    gridOptions.forEach((option) => {
        option.checked = option.value === mode;
    });
}

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

    settingsButton?.setAttribute("aria-label", translations[language].openSettings);
    settingsCloseButton?.setAttribute("aria-label", translations[language].closeSettings);

    updateLanguageButtons(language);
}

const initialTheme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

const initialLanguage: Language = document.documentElement.lang === "en" ? "en" : "pt-BR";
updateThemeButtons(initialTheme);
setLanguage(initialLanguage);

const savedGridMode = localStorage.getItem("preferredGridMode");
const initialGridMode: GridMode = savedGridMode && isGridMode(savedGridMode) ? savedGridMode : "four";
setGridMode(initialGridMode);

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

gridOptions.forEach((option) => {
    option.addEventListener("change", () => {
        if (option.checked && isGridMode(option.value)) {
            setGridMode(option.value);
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
const history: Stroke[][] = [];
const redoHistory: Stroke[][] = [];

function saveHistory(): void {
    const snapshot = strokes.map((stroke) => stroke.map((point) => ({ ...point })));
    history.push(snapshot);
    redoHistory.length = 0;
    updateHistoryButtons();
}

function undo(): void {
    if (isDrawing || history.length === 0) return;

    const previousState = history.pop();
    if (!previousState) return;

    const currentState = strokes.map((stroke) => stroke.map((point) => ({ ...point })));
    redoHistory.push(currentState);

    strokes.length = 0;
    strokes.push(...previousState);

    drawStrokes();
    updateHistoryButtons();
}

function redo(): void {
    if (isDrawing || redoHistory.length === 0) return;

    const nextState = redoHistory.pop();
    if (!nextState) return;

    const currentState = strokes.map((stroke) => stroke.map((point) => ({ ...point })));
    history.push(currentState);

    strokes.length = 0;
    strokes.push(...nextState);

    drawStrokes();
    updateHistoryButtons();
}

function updateHistoryButtons(): void {
    if (undoButton) {
        undoButton.disabled = isDrawing || history.length === 0;
    }
    if (redoButton) {
        redoButton.disabled = isDrawing || redoHistory.length === 0;
    }
}

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

    saveHistory();
    isDrawing = true;
    updateHistoryButtons();
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
    if (!isDrawing) return;
    isDrawing = false;
    updateHistoryButtons();
}

function openSettings(): void {
    if (!settingsPanel || settingsPanel.open) return;

    settingsPanel.showModal();
    settingsButton?.setAttribute("aria-expanded", "true");
    settingsCloseButton?.focus();
}

function closeSettings(): void {
    if (!settingsPanel || !settingsPanel.open) return;

    settingsPanel.close();
}

if (canvas) {
    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", continueDrawing);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    canvas.addEventListener("lostpointercapture", stopDrawing);
}

settingsButton?.addEventListener("click", openSettings);
settingsCloseButton?.addEventListener("click", closeSettings);

settingsPanel?.addEventListener("close", () => {
    settingsButton?.setAttribute("aria-expanded", "false");
    settingsButton?.focus();
});

settingsPanel?.addEventListener("click", (event: MouseEvent) => {
    if (event.target !== settingsPanel) return;

    const rect = settingsPanel.getBoundingClientRect();

    const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

    if (clickedOutside) {
        closeSettings();
    }
});

settingsPanel?.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !settingsPanel.open) return;

    const focusableElements = Array.from(
        settingsPanel.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ).filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));

    if (focusableElements.length === 0) {
        event.preventDefault();
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    
    if (event.altKey) return;

    const isUndo = modifier && key === "z" && !event.shiftKey;
    const isRedo = modifier && ((key === "y" && !event.shiftKey) || (key === "z" && event.shiftKey));

    if (!isUndo && !isRedo) return;

    const target = event.target;

    if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName))) {
        return;
    }

    if (settingsPanel?.open || isDrawing) return;

    event.preventDefault();

    if (isUndo) {
        undo();
    } else {
        redo();
    }
});

undoButton?.addEventListener("click", undo);
redoButton?.addEventListener("click", redo);

updateHistoryButtons();
