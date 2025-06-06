/**
 * @file theme-provider.tsx
 * @description
 * Provides the `ThemeProvider` React context and hook for managing and persisting application theme
 * (light, dark, or system) across the UI. Applies the selected theme to the document root and
 * synchronizes with localStorage.
 * 
 * Technologies: React, TypeScript
 * 
 * Exports:
 * - ThemeProvider: Context provider for theme state and setter.
 * - useTheme: Custom hook to access and update the current theme.
 * 
 * Types:
 * - Theme: Union type for theme values ("dark" | "light" | "system").
 * - ThemeProviderProps: Props for configuring the provider's children, default theme, and storage key.
 * - ThemeProviderState: Context value shape with theme and setTheme function.
 */

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

/**
 * Props for the ThemeProvider component.
 */
type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

/**
 * State and actions provided by the ThemeProvider context.
 */
type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/**
 * ThemeProvider component that manages and provides theme state to its children.
 * Applies the selected theme to the document root and persists it in localStorage.
 * 
 * @param children - React children nodes.
 * @param defaultTheme - Default theme to use if none is stored.
 * @param storageKey - Key for localStorage persistence.
 */
export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                                  storageKey = "vite-ui-theme",
                                  ...props
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

/**
 * Custom hook to access the current theme and setTheme function from context.
 * Throws an error if used outside of ThemeProvider.
 * 
 * @returns ThemeProviderState
 */
export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}