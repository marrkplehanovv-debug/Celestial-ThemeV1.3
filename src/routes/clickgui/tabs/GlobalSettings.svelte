<script lang="ts">
    import {onMount} from "svelte";
    import Pickr from "@simonwep/pickr";
    import "@simonwep/pickr/dist/themes/classic.min.css";
    import "../setting/pickr.scss";
    import type {ConfigurableSetting as ConfigurableSettingData} from "../../../integration/types";
    import {getGlobalSettings, setGlobalSettings} from "../../../integration/rest";
    import {THEME_PALETTES, themePalette, selectThemePalette, updateCustomThemeColor, normalizePaletteColor,
        type CustomColorKey} from "../../../theme/theme_config";
    import ConfigurableSetting from "../setting/ConfigurableSetting.svelte";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    import WindowPanel from "./WindowPanel.svelte";
    import ScaledClickGuiContent from "../ScaledClickGuiContent.svelte";

    let globalSettings = $state<ConfigurableSettingData | null>(null);
    let error = $state("");
    let saveQueue = Promise.resolve();
    let openColor = $state<CustomColorKey | null>(null);
    const customColors: {key: CustomColorKey; label: string}[] = [
        {key: "customStart", label: "Первый цвет"},
        {key: "customEnd", label: "Второй цвет"}
    ];

    async function updateGlobalSettings() {
        if (!globalSettings) return;
        const snapshot = $state.snapshot(globalSettings);
        const save = saveQueue.catch(() => {}).then(() => setGlobalSettings(snapshot));
        saveQueue = save;
        try {
            await save;
            error = "";
        } catch {
            error = "Не удалось сохранить настройки клиента";
        }
    }

    async function changePalette(id: string, animated = $themePalette.animated) {
        try {
            await selectThemePalette(id, animated);
            error = "";
        } catch {
            error = "Не удалось сохранить палитру";
        }
    }

    async function changeCustomColor(key: CustomColorKey, color: string) {
        try {
            await updateCustomThemeColor(key, color);
            error = "";
        } catch {
            error = "Не удалось сохранить палитру";
        }
    }

    function colorPicker(node: HTMLButtonElement, options: {key: CustomColorKey; color: string}) {
        const key = options.key;
        const picker = Pickr.create({
            el: node,
            container: node.parentElement!,
            theme: "classic",
            inline: true,
            showAlways: true,
            default: options.color,
            lockOpacity: true,
            components: {preview: false, opacity: false, hue: true},
            i18n: {"aria:palette": `Выбор цвета: ${key === "customStart" ? "первый" : "второй"}`,
                "aria:hue": "Оттенок"}
        });
        picker.on("change", (color: Pickr.HSVaColor) => {
            void changeCustomColor(key, color.toHEXA().toString().slice(0, 7));
        });
        picker.on("init", () => picker.setColor($themePalette[key], true));
        return {
            update(value: {key: CustomColorKey; color: string}) {
                if (picker.getColor()?.toHEXA().toString().slice(0, 7).toLowerCase() !== value.color) {
                    picker.setColor(value.color, true);
                }
            },
            destroy() {picker.destroyAndRemove();}
        };
    }

    onMount(() => {
        getGlobalSettings().then(settings => globalSettings = settings)
            .catch(() => error = "Не удалось загрузить настройки клиента");
    });
</script>

<ScaledClickGuiContent>
    <WindowPanel title="Celestial · Settings" icon="client">
        <section class="palette-settings" aria-label="Theme palette">
            <div class="palette-heading">
                <h2>Theme palette</h2>
                <label class="animation">
                    <input type="checkbox" checked={$themePalette.animated}
                           onchange={e => changePalette($themePalette.id, e.currentTarget.checked)}/>
                    Плавное переливание
                </label>
            </div>
            <div class="palettes">
                {#each THEME_PALETTES as palette (palette.id)}
                    <button type="button" class="palette" class:selected={$themePalette.id === palette.id}
                            aria-pressed={$themePalette.id === palette.id}
                            style="--preview-start: {palette.id === 'custom' ? $themePalette.customStart : palette.start}; --preview-end: {palette.id === 'custom' ? $themePalette.customEnd : palette.end};"
                            onclick={() => changePalette(palette.id)}>
                        <span class="preview" class:rainbow={palette.id === 'rainbow'}></span>
                        <span>{palette.name}</span>
                    </button>
                {/each}
            </div>
            <div class="custom-editor" aria-label="Редактор палитры">
                {#each customColors as color (color.key)}
                    <div class="color-control">
                        <label for={`palette-${color.key}`}>{color.label}</label>
                        <div class="color-value">
                            <button type="button" class="color-swatch" style:background={$themePalette[color.key]}
                                    aria-label={`Выбрать: ${color.label.toLowerCase()}`}
                                    aria-expanded={openColor === color.key} aria-controls={`picker-${color.key}`}
                                    onclick={() => openColor = openColor === color.key ? null : color.key}></button>
                            <input id={`palette-${color.key}`} aria-label={color.label} type="text"
                                   value={$themePalette[color.key]} pattern="#[0-9a-fA-F]{6}" maxlength="7"
                                   spellcheck="false" autocomplete="off" title="HEX-цвет, например #ff334c"
                                   oninput={e => {
                                       if (normalizePaletteColor(e.currentTarget.value)) {
                                           void changeCustomColor(color.key, e.currentTarget.value);
                                       }
                                   }}
                                   onchange={e => e.currentTarget.value = $themePalette[color.key]}/>
                        </div>
                        {#if openColor === color.key}
                            <div class="palette-picker" id={`picker-${color.key}`}>
                                <button type="button" aria-label={`Палитра: ${color.label.toLowerCase()}`}
                                        use:colorPicker={{key: color.key, color: $themePalette[color.key]}}></button>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <p>Нажми на цвет или введи HEX-код — включится Custom. Два цвета сохраняются при смене режима.
                Rainbow переливается по всему спектру, Astolfo — между розовым и голубым.
                Палитра общая для HUD и ClickGUI.</p>
        </section>
        {#if error}<div class="error" role="alert">{error}</div>{/if}
        <div class="settings-grid">
            {#if globalSettings}
                {#each globalSettings.value as setting, i (setting.name)}
                    <div class="setting-item">
                        {#if setting.valueType === "CONFIGURABLE" || setting.valueType === "TOGGLEABLE"}
                            <ConfigurableSetting path="clickgui.global"
                                    bind:setting={globalSettings.value[i]}
                                    hideExpandControl on:change={updateGlobalSettings}/>
                        {:else}
                            <GenericSetting path="clickgui.global"
                                    bind:setting={globalSettings.value[i]} on:change={updateGlobalSettings}/>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
    </WindowPanel>
</ScaledClickGuiContent>

<style lang="scss">
    .palette-settings, .setting-item {
        --clickgui-text-color: #ffffff;
        --clickgui-text-dimmed-color: #d3d3d3;
        color: #ffffff;
        background: var(--celestial-settings-surface);
        border: 1px solid #ffffff20;
        border-radius: 6px;
        box-shadow: 0 2px 8px #0004;
        padding: 12px;
        min-width: 0;
    }
    .palette-settings {margin-bottom: 14px; border-top: 3px solid var(--accent-color);}
    .palette-heading {display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;}
    h2 {font-size: 16px; font-weight: 500;}
    .animation {display: flex; gap: 8px; align-items: center; font-size: 12px; cursor: pointer;}
    .animation input {accent-color: var(--accent-color);}
    .palettes {display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin: 12px 0;}
    .palette {display: flex; flex-direction: column; gap: 5px; padding: 6px; color: #fff; font: inherit; font-size: 12px; background: #ffffff0a; border: 1px solid #ffffff20; border-radius: 5px; cursor: pointer;}
    .preview {width: 100%; height: 20px; border-radius: 3px; background: linear-gradient(100deg, var(--preview-start), var(--preview-end));}
    .preview.rainbow {background: linear-gradient(100deg, #ff6b6b, #ffd166, #74e891, #67ddff, #9b9bff, #ff9ed2);}
    .palette.selected, .palette:hover {border-color: var(--celestial-hud-light); box-shadow: var(--celestial-glow);}
    .palette:focus-visible {outline: 2px solid #fff; outline-offset: 2px;}
    .custom-editor {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 12px 0;}
    .color-control {min-width: 0; padding: 10px; background: #0003; border: 1px solid #ffffff20; border-radius: 5px;}
    .color-control label {display: block; font-size: 12px; margin-bottom: 8px;}
    .color-value {display: flex; align-items: center; gap: 10px;}
    .color-swatch {flex: 0 0 36px; height: 28px; border: 1px solid #ffffff60; border-radius: 4px; cursor: pointer;}
    .color-value input {width: 100%; min-width: 0; padding: 6px; color: #fff; background: #0004; border: 1px solid #ffffff30; border-radius: 4px; font: 12px monospace;}
    .color-value input:invalid {border-color: #ff8298;}
    .color-swatch:focus-visible, .color-value input:focus-visible {outline: 2px solid #fff; outline-offset: 2px;}
    .palette-picker :global(.pcr-app) {margin-bottom: 0; box-shadow: none;}
    p {font-size: 11px; color: #d3d3d3;}
    .settings-grid {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start;}
    .setting-item {border-top: 3px solid var(--accent-color);}
    .error {color: #650e1a; background: #ffe2e9; padding: 8px; margin-bottom: 12px; border-radius: 4px; font-size: 13px;}
    @media (max-width: 700px) {.settings-grid {grid-template-columns: 1fr;}}
    @media (max-width: 450px) {.custom-editor {grid-template-columns: 1fr;}}
</style>
