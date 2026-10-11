<script lang="ts">
    import {onMount, onDestroy, tick} from "svelte";
    import {getModuleSettings, setModuleSettings, setModuleEnabled} from "../../integration/rest";
    import type {BindSetting, ConfigurableSetting, BindModifier} from "../../integration/types";
    import GenericSetting from "./setting/common/GenericSetting.svelte";
    import {slide} from "svelte/transition";
    import {description as descriptionStore, highlightModuleName, scaleFactor} from "./clickgui_store";
    import {setItem, persistentDataLoaded} from "../../integration/persistent_storage";
    import {browserKey, displayName, spaceSeperatedNames} from "../../theme/theme_config";
    import {listen} from "../../integration/ws";
    import {UNKNOWN_KEY} from "../../util/utils";

    export let name: string;
    export let enabled: boolean;
    export let description: string;
    let moduleNameElement: HTMLButtonElement;
    let configurable: ConfigurableSetting | undefined;
    const path = `celestial.module.${name}`;
    let expanded = false;
    let binding = false;
    let busy = false;
    let error = "";
    let bindingReady = 0;
    $: bindSetting = configurable?.value.find(value => value.valueType === "BIND") as BindSetting | undefined;
    $: shownName = displayName(name, $spaceSeperatedNames);
    $: hasSettings = Boolean(configurable?.value.length);

    onMount(() => {
        fetchSettings();
        persistentDataLoaded.then(() => expanded = localStorage.getItem(path) === "true");
    });
    const unsubscribe = highlightModuleName.subscribe(async module => {
        if (name !== module) return;
        expanded = true;
        await tick();
        moduleNameElement?.scrollIntoView({behavior: "smooth", block: "nearest"});
    });
    onDestroy(unsubscribe);

    async function fetchSettings() {
        try {configurable = await getModuleSettings(name);} catch {error = "Не удалось загрузить настройки";}
    }
    async function updateSettings() {
        if (!configurable || busy) return;
        busy = true;
        error = "";
        try {
            await setModuleSettings(name, configurable);
            await fetchSettings();
        } catch {error = "Не удалось сохранить настройки";}
        finally {busy = false;}
    }
    async function toggleModule() {
        if (busy) return;
        busy = true;
        error = "";
        try {await setModuleEnabled(name, !enabled);} catch {error = "Не удалось переключить модуль";}
        finally {busy = false;}
    }
    function toggleExpanded() {
        expanded = !expanded;
        setItem(path, String(expanded));
        if (!configurable) fetchSettings();
    }
    function setDescription() {
        const rect = moduleNameElement.getBoundingClientRect();
        const right = window.innerWidth - rect.right > 260;
        descriptionStore.set({x: (right ? rect.right : rect.left) * 2 / $scaleFactor,
            y: (rect.top + rect.height / 2) * 2 / $scaleFactor,
            anchor: right ? "right" : "left", description: description || shownName});
    }
    function startBinding(event: MouseEvent) {
        if (event.button !== 1 || busy) return;
        event.preventDefault();
        binding = !binding;
        bindingReady = Date.now() + 150;
        if (!bindSetting) fetchSettings();
    }
    async function finishBinding(key: string, modifiers: BindModifier[] = []) {
        if (!binding || !bindSetting || Date.now() < bindingReady) return;
        binding = false;
        bindSetting.value = {...bindSetting.value, boundKey: key === "key.keyboard.escape" || key === "key.keyboard.delete" ? UNKNOWN_KEY : key, modifiers};
        await updateSettings();
    }
    function browserBind(event: KeyboardEvent) {
        if (!binding) return;
        const key = browserKey(event.code);
        if (!key) return;
        event.preventDefault();
        const modifiers: BindModifier[] = [];
        if (event.shiftKey && !event.code.startsWith("Shift")) modifiers.push("Shift");
        if (event.ctrlKey && !event.code.startsWith("Control")) modifiers.push("Control");
        if (event.altKey && !event.code.startsWith("Alt")) modifiers.push("Alt");
        if (event.metaKey && !event.code.startsWith("Meta")) modifiers.push("Super");
        finishBinding(key, modifiers);
    }
    listen("keyboardKey", event => {
        if (event.action !== 1) return;
        const modifiers: BindModifier[] = [];
        if (event.mods & 1 && !event.key.endsWith("shift")) modifiers.push("Shift");
        if (event.mods & 2 && !event.key.endsWith("control")) modifiers.push("Control");
        if (event.mods & 4 && !event.key.endsWith("alt")) modifiers.push("Alt");
        if (event.mods & 8 && !event.key.endsWith("win")) modifiers.push("Super");
        finishBinding(event.key, modifiers);
    });
    listen("mouseButton", event => {if (event.action === 1) finishBinding(event.key);});
</script>

<svelte:window on:keydown={browserBind}/>

<div class="module" class:enabled class:expanded style="--clickgui-text-color: {enabled ? '#ffffff' : '#000000'}; --clickgui-text-dimmed-color: {enabled ? '#d2d2d2' : '#565656'}">
    <div class="row" class:highlight={name === $highlightModuleName}>
        <button class="name" aria-pressed={enabled} disabled={busy} on:click={toggleModule} on:contextmenu|preventDefault={toggleExpanded} on:mousedown={startBinding} on:mouseenter={setDescription} on:mouseleave={() => descriptionStore.set(null)} bind:this={moduleNameElement}>{binding ? "Press a key..." : shownName}</button>
        {#if hasSettings}<button class="expand-arrow" aria-label={`Настройки ${name}`} aria-expanded={expanded} on:click={toggleExpanded} on:contextmenu|preventDefault={toggleExpanded}><span></span></button>{/if}
    </div>
    {#if expanded && configurable}
        <fieldset class="settings" disabled={busy} transition:slide={{duration: 180}}>
            {#each configurable.value as setting, index (setting.name)}<GenericSetting {path} bind:setting={configurable.value[index]} on:change={updateSettings}/>{/each}
        </fieldset>
    {/if}
    {#if error}<div class="error" role="alert">{error}</div>{/if}
</div>

<style lang="scss">
    .module {position: relative; margin: 4px 6px; color: black; background: white; border-radius: 2px; box-shadow: 0 0 10px #0005;}
    .module.enabled {background: var(--celestial-gradient); color: white; text-shadow: 1px 1px #0005;}
    .row {height: 32px; position: relative;}
    button {font-family: inherit; color: inherit; cursor: pointer; border: 0; background: none;}
    button:focus-visible {outline: 2px solid var(--accent-color); outline-offset: -2px;}
    .name {width: 100%; height: 100%; padding: 0 20px 0 8px; text-align: center; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: inherit;}
    .name:disabled {cursor: wait;}
    .expand-arrow {position: absolute; right: 0; top: 0; width: 22px; height: 32px; display: grid; place-items: center;}
    .expand-arrow span {width: 6px; height: 6px; border-right: 1px solid currentColor; border-bottom: 1px solid currentColor; transform: rotate(-45deg); transition: transform 180ms;}
    .expanded .expand-arrow span {transform: rotate(45deg);}
    .highlight {outline: 2px solid var(--accent-color);}
    .settings {--clickgui-text-color: #ffffff; --clickgui-text-dimmed-color: #d8d1df; color: #ffffff; background: var(--celestial-settings-surface); border: 0; border-top: 1px solid #ffffff20; padding: 6px 0 4px; min-width: 0; text-shadow: none;}
    .error {color: #9d102e; font-size: 12px; padding: 5px; background: #fff;}
</style>
