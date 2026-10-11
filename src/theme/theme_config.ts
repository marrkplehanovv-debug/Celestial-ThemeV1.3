import {listenAlways} from "../integration/ws";
import {getModuleSettings} from "../integration/rest";
import {get, writable} from "svelte/store";
import {setItem} from "../integration/persistent_storage";
import type {SpaceSeperatedNamesChangeEvent} from "../integration/events";

export let spaceSeperatedNames = writable(false);

const regex = /[A-Z]?[a-z]+|[A-Z]+[0-9]+|[0-9]+|[A-Z]+(?![a-z])/g;

/**
 * Handles space seperated names if enabled.
 */
export function convertToSpacedString(name: string): string {
    return name.match(regex)?.join(" ") ?? name;
}

async function updateSettings() {
    const hudSettings = await getModuleSettings("HUD");
    spaceSeperatedNames.set(hudSettings.value.find(n => n.name === "SpaceSeperatedNames")?.value as boolean ?? true);
}

listenAlways("spaceSeperatedNamesChange", (e: SpaceSeperatedNamesChangeEvent) => {
   spaceSeperatedNames.set(e.value);
});
updateSettings().catch(() => {});

import type {GroupedModules, Module} from "../integration/types";
import {getTextWidth} from "../integration/text_measurement";

export const CELESTIAL_CATEGORIES = ["Combat", "Movement", "Render", "Player", "Utility"];

export function displayName(name: string, spaced: boolean): string {
    if (!spaced) return name;
    return name.match(/[A-Z]?[a-z]+|[A-Z]+[0-9]+|[0-9]+|[A-Z]+(?![a-z])/g)?.join(" ") ?? name;
}

export function groupCelestialModules(modules: Module[]): GroupedModules {
    const grouped: GroupedModules = Object.fromEntries(CELESTIAL_CATEGORIES.map(name => [name, []]));
    for (const module of modules) {
        const category = CELESTIAL_CATEGORIES.find(name => name.toLowerCase() === module.category.toLowerCase());
        grouped[category ?? "Utility"].push(module);
    }
    return grouped;
}

export function sortAlphabetically(modules: Module[], spaced: boolean): Module[] {
    return [...modules].sort((a, b) =>
        displayName(a.name, spaced).localeCompare(displayName(b.name, spaced), "en", {sensitivity: "base", numeric: true})
        || a.name.localeCompare(b.name, "en"));
}

export function sortByWidth(modules: Module[], spaced: boolean, font = "16px Celestial"): Module[] {
    return [...modules].sort((a, b) =>
        getTextWidth(displayName(b.name, spaced), font) - getTextWidth(displayName(a.name, spaced), font)
        || a.name.localeCompare(b.name));
}

export function panelPosition(index: number, width: number): {left: number; top: number} {
    const columns = Math.max(1, Math.floor((width - 36) / 256));
    return {left: 36 + index % columns * 256, top: 20 + Math.floor(index / columns) * 520};
}

export function browserKey(code: string): string | null {
    if (/^Key[A-Z]$/.test(code)) return `key.keyboard.${code.slice(3).toLowerCase()}`;
    if (/^Digit[0-9]$/.test(code)) return `key.keyboard.${code.slice(5)}`;
    if (/^F\d+$/.test(code)) return `key.keyboard.${code.toLowerCase()}`;
    const keys: Record<string, string> = {
        Space: "space", Enter: "enter", Escape: "escape", Backspace: "backspace", Delete: "delete",
        Tab: "tab", Insert: "insert", Home: "home", End: "end", PageUp: "page.up", PageDown: "page.down",
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        ShiftLeft: "left.shift", ShiftRight: "right.shift", ControlLeft: "left.control",
        ControlRight: "right.control", AltLeft: "left.alt", AltRight: "right.alt",
        MetaLeft: "left.win", MetaRight: "right.win", Minus: "minus", Equal: "equal",
        BracketLeft: "left.bracket", BracketRight: "right.bracket", Semicolon: "semicolon",
        Quote: "apostrophe", Backquote: "grave.accent", Backslash: "backslash",
        Comma: "comma", Period: "period", Slash: "slash", CapsLock: "caps.lock",
    };
    return keys[code] ? `key.keyboard.${keys[code]}` : null;
}

export function healthFraction(health: number, maxHealth: number): number {
    return maxHealth > 0 ? Math.min(1, Math.max(0, health / maxHealth)) : 0;
}

export function effectTime(duration: number, infinite = false): string {
    if (infinite || duration < 0) return "∞";
    const seconds = Math.max(0, Math.floor(duration / 20));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export const THEME_PALETTES = [
    {id: "celestial", name: "Celestial", start: "#bf68ff", end: "#35114f"},
    {id: "crimson", name: "Crimson / Black", start: "#ff334c", end: "#080808"},
    {id: "ocean", name: "Ocean", start: "#52d8ff", end: "#1746a8"},
    {id: "emerald", name: "Emerald", start: "#65e9b1", end: "#125348"},
    {id: "sunset", name: "Sunset", start: "#ffae70", end: "#b42b65"},
    {id: "aurora", name: "Aurora", start: "#64e6ff", end: "#9e4dff"},
    {id: "gold", name: "Gold", start: "#ffda77", end: "#73501c"},
    {id: "rose", name: "Rose", start: "#ff9bcb", end: "#853966"},
    {id: "client", name: "Client Accent", start: "#bf68ff", end: "#35114f"}
] as const;

type PaletteSettings = {id: string; animated: boolean};
const PALETTE_KEY = "celestial.palette";
export const themePalette = writable<PaletteSettings>({id: "celestial", animated: true});

export function parseThemePalette(stored: string | null): PaletteSettings {
    try {
        const value = JSON.parse(stored ?? "null");
        if (value && THEME_PALETTES.some(p => p.id === value.id) && typeof value.animated === "boolean") {
            return {id: value.id, animated: value.animated};
        }
    } catch {}
    return {id: "celestial", animated: true};
}

function applyThemePalette(value: PaletteSettings) {
    const palette = THEME_PALETTES.find(p => p.id === value.id) ?? THEME_PALETTES[0];
    const root = document.documentElement;
    root.style.removeProperty("--accent-color");
    root.style.setProperty("--celestial-color-start", palette.id === "client" ? "var(--celestial-client-accent, #bf68ff)" : palette.start);
    root.style.setProperty("--celestial-color-end", palette.id === "client" ? "color-mix(in srgb, var(--celestial-client-accent, #bf68ff) 30%, #080808)" : palette.end);
    root.dataset.celestialMotion = value.animated ? "on" : "off";
}

export function initializeThemePalette(): () => void {
    themePalette.set(parseThemePalette(localStorage.getItem(PALETTE_KEY)));
    const unsubscribe = themePalette.subscribe(applyThemePalette);
    const onStorage = (event: StorageEvent) => {
        if (event.key === PALETTE_KEY) themePalette.set(parseThemePalette(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => {
        unsubscribe();
        window.removeEventListener("storage", onStorage);
    };
}

export async function selectThemePalette(id: string, animated = get(themePalette).animated) {
    if (!THEME_PALETTES.some(p => p.id === id)) return;
    const value = {id, animated};
    themePalette.set(value);
    await setItem(PALETTE_KEY, JSON.stringify(value));
}
