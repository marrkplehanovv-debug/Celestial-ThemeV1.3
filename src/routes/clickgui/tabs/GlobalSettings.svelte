<script lang="ts">
    import {onMount} from "svelte";
    import type {ConfigurableSetting as ConfigurableSettingData} from "../../../integration/types";
    import {getGlobalSettings, setGlobalSettings} from "../../../integration/rest";
    import {THEME_PALETTES, themePalette, selectThemePalette} from "../../../theme/theme_config";
    import ConfigurableSetting from "../setting/ConfigurableSetting.svelte";
    import GenericSetting from "../setting/common/GenericSetting.svelte";
    import WindowPanel from "./WindowPanel.svelte";
    import ScaledClickGuiContent from "../ScaledClickGuiContent.svelte";

    let globalSettings = $state<ConfigurableSettingData | null>(null);
    let error = $state("");
    let saveQueue = Promise.resolve();

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
        } catch {
            error = "Не удалось сохранить палитру";
        }
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
                            style="--preview-start: {palette.id === 'client' ? 'var(--celestial-client-accent, #bf68ff)' : palette.start}; --preview-end: {palette.id === 'client' ? 'color-mix(in srgb, var(--celestial-client-accent, #bf68ff) 30%, #080808)' : palette.end};"
                            onclick={() => changePalette(palette.id)}>
                        <span class="preview"></span>
                        <span>{palette.name}</span>
                    </button>
                {/each}
            </div>
            <p>Одна палитра для HUD и ClickGUI. Client Accent использует цвет LiquidBounce.</p>
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
    .palette.selected, .palette:hover {border-color: var(--celestial-hud-light); box-shadow: var(--celestial-glow);}
    .palette:focus-visible {outline: 2px solid #fff; outline-offset: 2px;}
    p {font-size: 11px; color: #d3d3d3;}
    .settings-grid {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start;}
    .setting-item {border-top: 3px solid var(--accent-color);}
    .error {color: #650e1a; background: #ffe2e9; padding: 8px; margin-bottom: 12px; border-radius: 4px; font-size: 13px;}
    @media (max-width: 700px) {.settings-grid {grid-template-columns: 1fr;}}
</style>
