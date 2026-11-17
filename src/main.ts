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


const strokes: Stroke[] = [
    [
        { x: 100, y: 100 },
        { x: 150, y: 150 },
        { x: 200, y: 200 },
        { x: 250, y: 250 },
        { x: 300, y: 300 }
    ],
    [
        { x: 300, y: 100 },
        { x: 250, y: 150 },
        { x: 200, y: 200 },
        { x: 150, y: 250 },
        { x: 100, y: 300 }
    ]
];


const canvas = document.querySelector<HTMLCanvasElement>("#kanjiCanvas");
const ctx = canvas?.getContext("2d");

function drawStrokes(): void {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim();

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach((stroke) => {
        if (stroke.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);

        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }

        ctx.stroke();
    });
}

drawStrokes();