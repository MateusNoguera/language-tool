const ptBR = {
    welcomeTitle: "Bem-vindo ao Language Tool",
    welcomeDescription: "Sua plataforma de estudo de idiomas."
};

type TranslationKey = keyof typeof ptBR;
type TranslationDictionary = Record<TranslationKey, string>;

export const translations = {
    "pt-BR": ptBR,
    "en": {
        welcomeTitle: "Welcome to Language Tool",
        welcomeDescription: "Your language learning platform."
    }
} satisfies Record<"pt-BR" | "en", TranslationDictionary>;

export type Language = keyof typeof translations;
export type { TranslationKey };
