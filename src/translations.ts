const ptBR = {
    welcomeTitle: "Bem-vindo ao Language Tool",
    welcomeDescription: "Sua plataforma de estudo de idiomas.",
    kanjiPracticeTitle: "Prática de Kanji",
    kanjiPracticeDescription: "Desenhe o kanji apresentado abaixo.",
    settingsTitle: "Configurações",
    settingsDescription: "Personalize sua experiência de estudo.",
    openSettings: "Abrir configurações",
    closeSettings: "Fechar configurações",
    kanjiSettingsTitle: "Escrita de Kanji",
    gridSettingsTitle: "Grade de orientação",
    gridSettingsDescription: "Escolha as linhas de referência para ajudar no posicionamento dos traços.",
    gridNone: "Sem grade",
    gridFour: "4 quadrantes (2 x 2)",
    gridSixteen: "16 quadrantes (4 x 4)",
    gridDiagonal: "4 quadrantes + diagonais",
    undo: "Desfazer",
    redo: "Refazer",
    clear: "Limpar",
    drawTool: "Desenhar",
    eraserTool: "Borracha",
    evaluateKanji: "Avaliar"
};

type TranslationKey = keyof typeof ptBR;
type TranslationDictionary = Record<TranslationKey, string>;

export const translations = {
    "pt-BR": ptBR,
    "en": {
        welcomeTitle: "Welcome to Language Tool",
        welcomeDescription: "Your language learning platform.",
        kanjiPracticeTitle: "Kanji Practice",
        kanjiPracticeDescription: "Draw the kanji shown below.",
        settingsTitle: "Settings",
        settingsDescription: "Customize your learning experience.",
        openSettings: "Open settings",
        closeSettings: "Close settings",
        kanjiSettingsTitle: "Kanji Writing",
        gridSettingsTitle: "Guideline Grid",
        gridSettingsDescription: "Choose reference lines to help position your strokes.",
        gridNone: "No grid",
        gridFour: "4 quadrants (2 x 2)",
        gridSixteen: "16 quadrants (4 x 4)",
        gridDiagonal: "4 quadrants + diagonals",
        undo: "Undo",
        redo: "Redo",
        clear: "Clear",
        drawTool: "Draw",
        eraserTool: "Eraser",
        evaluateKanji: "Evaluate"
    }
} satisfies Record<"pt-BR" | "en", TranslationDictionary>;

export type Language = keyof typeof translations;
export type { TranslationKey };