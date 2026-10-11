/// <reference types="svelte" />
/// <reference types="vite/client" />

interface HudArrayListSettings {
    showTags: boolean;
    itemAlignment: "Left" | "Right";
    order: "Ascending" | "Descending";
}
interface HudNotificationsSettings {severities: import("./integration/events").NotificationSeverity[];}
interface HudScoreboardSettings {show: ("Header" | "Name" | "Score")[]; replaceRegex: string; replaceWith: string;}
interface HudBlockCounterSettings {iconPosition: "None" | "Left" | "Right" | "Top" | "Bottom";}
interface HudInventoryStatisticsSettings {items: string[]; showEmpty: boolean; rowLength: number;}
interface HudTextSettings {
    text: string; font: string; size: number; color: number;
    decorations: {bold: boolean; italic: boolean; underline: boolean; strikethrough: boolean};
    shadow: {enabled: boolean; offsetX: number; offsetY: number; blurRadius: number; color: number};
    glow: {enabled: boolean; radius: number; color: number};
}
