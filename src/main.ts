type Theme = "light" | "dark";

const themeButtons = document.querySelectorAll<HTMLButtonElement>(".ThemeOption");

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
}

const initialTheme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";

updateThemeButtons(initialTheme);

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const themeValue = button.dataset.themeValue;

        if (themeValue === "light" || themeValue === "dark") {
            setTheme(themeValue);
        }
    });
});