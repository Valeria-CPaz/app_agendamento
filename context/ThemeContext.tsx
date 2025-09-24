import React, { createContext, useContext, useState } from "react";
import { getTheme } from "@/theme/theme";


export type ThemeName = "light" | "dark";
export const ThemeContext = createContext<{
    themeName: ThemeName;
    setThemeName: (v: ThemeName) => void;
    theme: ReturnType<typeof getTheme>;
}>({
    themeName: "light",
    setThemeName: () => { },
    theme: getTheme("light"),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>("light");

    const value = {
        themeName,
        setThemeName,
        theme: getTheme(themeName),
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeName() {
    return useContext(ThemeContext).themeName;
}
export function useSetThemeName() {
    return useContext(ThemeContext).setThemeName;
}
export function useTheme() {
    return useContext(ThemeContext).theme;
}
