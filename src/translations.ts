const ptBR = {
    welcomeTitle: "Bem-vindo ao Language Tool",
    welcomeDescription: "Sua plataforma de estudo de idiomas.",
    kanjiPracticeTitle: "Prática de Kanji",
    kanjiPracticeDescription: "Desenhe o kanji apresentado abaixo.",
    settingsTitle: "Configurações",
    settingsDescription: "Personalize sua experiência de estudo.",
    openSettings: "Abrir configurações",
    closeSettings: "Fechar configurações"
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
        closeSettings: "Close settings"
    }
} satisfies Record<"pt-BR" | "en", TranslationDictionary>;

export type Language = keyof typeof translations;
export type { TranslationKey };