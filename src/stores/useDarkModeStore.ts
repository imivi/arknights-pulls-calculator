import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    darkMode: boolean
    setDarkMode: (darkMode: boolean) => void
}

export const useDarkModeStore = create(persist<Store>((set) => ({
    darkMode: userPrefersDarkMode(),
    setDarkMode: (darkMode) => set({ darkMode }),
}),
    { name: "dark_mode" },
))


function userPrefersDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}