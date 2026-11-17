const ptBR = {
    welcomeTitle: "Bem-vindo ao Language Tool",
    welcomeDescription: "Sua plataforma de estudo de idiomas.",
    kanjiPracticeTitle: "Prática de Kanji",
    kanjiPracticeDescription: "Desenhe o kanji apresentado abaixo."
};

type TranslationKey = keyof typeof ptBR;
type TranslationDictionary = Record<TranslationKey, string>;

export const translations = {
    "pt-BR": ptBR,
    "en": {
        welcomeTitle: "Welcome to Language Tool",
        welcomeDescription: "Your language learning platform.",
        kanjiPracticeTitle: "Kanji Practice",
        kanjiPracticeDescription: "Draw the kanji shown below."
    }
} satisfies Record<"pt-BR" | "en", TranslationDictionary>;

export type Language = keyof typeof translations;
export type { TranslationKey };