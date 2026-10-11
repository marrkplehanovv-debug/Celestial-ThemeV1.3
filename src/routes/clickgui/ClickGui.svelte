<script lang="ts">
    import type {GroupedModules, Module, ConfigurableSetting} from "../../integration/types";
    import Panel from "./Panel.svelte";
    import Search from "./Search.svelte";
    import Description from "./Description.svelte";
    import {fade} from "svelte/transition";
    import {onMount} from "svelte";
    import {getModules, getModuleSettings, setModuleSettings, setModuleEnabled} from "../../integration/rest";
    import {persistentDataLoaded, setItem} from "../../integration/persistent_storage";
    import {groupCelestialModules} from "../../theme/theme_config";
    import {gridSize, showGrid} from "./clickgui_store";
    import ScaledClickGuiContent from "./ScaledClickGuiContent.svelte";

    let categories = $state<GroupedModules>({});
    let modules = $state<Module[]>([]);
    type Profile = {name: string; enabled: boolean; settings: ConfigurableSetting}[];
    let profiles = $state<Record<string, Profile>>({});
    let profileName = $state("");
    let selected = $state("");
    let status = $state("");
    let busy = $state(false);
    let error = $state("");

    onMount(async () => {
        await persistentDataLoaded;
        try {
            const stored = JSON.parse(localStorage.getItem("celestial.profiles") ?? "{}");
            if (stored && typeof stored === "object" && !Array.isArray(stored)) profiles = stored;
        } catch {status = "Saved profiles could not be read";}
    });

    async function persistProfiles() {
        await setItem("celestial.profiles", JSON.stringify($state.snapshot(profiles)));
    }

    async function saveProfile() {
        const name = (profileName.trim() || selected).slice(0, 40);
        if (!name || busy) {status = "Enter a config name"; return;}
        busy = true;
        status = "Saving...";
        try {
            const snapshot: Profile = [];
            for (let i = 0; i < modules.length; i += 6) {
                const batch = await Promise.all(modules.slice(i, i + 6).map(async module => ({
                    name: module.name, enabled: module.enabled, settings: await getModuleSettings(module.name)
                })));
                snapshot.push(...batch);
            }
            profiles = {...profiles, [name]: snapshot};
            await persistProfiles();
            selected = name;
            status = "Saved";
        } catch {status = "Save failed. No profile was overwritten.";}
        finally {busy = false;}
    }

    async function loadProfile() {
        if (!Array.isArray(profiles[selected]) || busy) return;
        busy = true;
        status = "Loading...";
        try {
            const existing = new Map(modules.map(module => [module.name, module]));
            for (const entry of profiles[selected]) {
                const module = existing.get(entry.name);
                if (!module || !entry.settings) continue;
                await setModuleSettings(entry.name, entry.settings);
                if (module.enabled !== entry.enabled) await setModuleEnabled(entry.name, entry.enabled);
            }
            window.location.reload();
        } catch {status = "Loading stopped after an error; some settings may have changed.";
        } finally {busy = false;}
    }

    async function deleteProfile() {
        if (!profiles[selected] || busy) return;
        const name = selected;
        profiles = Object.fromEntries(Object.entries(profiles).filter(([key]) => key !== name));
        selected = "";
        await persistProfiles();
        status = "Deleted";
    }

    function downloadProfiles() {
        const file = new Blob([JSON.stringify($state.snapshot(profiles), null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(file);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "celestial-profiles.json";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async function importProfiles(event: Event) {
        const file = (event.currentTarget as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
            if (file.size > 5_000_000) throw new Error("Profile file too large");
            const contents: unknown = JSON.parse(await file.text());
            if (typeof contents !== "object" || contents === null || Array.isArray(contents)) throw new Error("Invalid profile file");
            const imported: Record<string, Profile> = {};
            for (const [name, profile] of Object.entries(contents)) {
                if (name.length > 40 || !Array.isArray(profile) || !profile.every(entry => typeof entry.name === "string" && typeof entry.enabled === "boolean" && entry.settings && Array.isArray(entry.settings.value))) throw new Error("Invalid profile entries");
                imported[name] = profile;
            }
            profiles = {...profiles, ...imported};
            await persistProfiles();
            status = "Imported";
        } catch {status = "Invalid profile file";}
        (event.currentTarget as HTMLInputElement).value = "";
    }

    onMount(async () => {
        try {
            await document.fonts.ready;
            modules = await getModules();
            categories = groupCelestialModules(modules);
        } catch {error = "Не удалось загрузить модули LiquidBounce";}
    });
</script>

<ScaledClickGuiContent>
    <div
            class="clickgui"
            class:grid={$showGrid}
            style="background-size: {$gridSize}px {$gridSize}px;"
            transition:fade|global={{duration: 200}}
    >
        <Description/>
        <Search modules={structuredClone($state.snapshot(modules))}/>

        {#each Object.entries(categories) as [category, modules], panelIndex (category)}
            <Panel {category} {modules} {panelIndex}/>
        {/each}
        <Panel category="Configs" modules={[]} panelIndex={5} compact>
            <div class="configs">
                <div class="profile-list">
                    {#each Object.keys(profiles) as name}<button class:selected={selected === name} disabled={busy} ondblclick={loadProfile} onclick={() => selected = name}>{name}</button>{:else}<span>No saved configs</span>{/each}
                </div>
                <input class="profile-input" aria-label="Config name" placeholder="Config name..." maxlength="40" disabled={busy} bind:value={profileName}/>
                <div class="config-actions">
                    <button title="Save modules and settings" disabled={busy} onclick={saveProfile}>+</button>
                    <button title="Delete selected config" disabled={busy || !selected} onclick={deleteProfile}>−</button>
                    <button title="Load selected config" disabled={busy || !selected} onclick={loadProfile}>Load</button>
                </div>
                <div class="config-actions">
                    <button disabled={busy} onclick={downloadProfiles}>Export</button>
                    <label class:disabled={busy}>Import<input type="file" accept=".json,application/json" disabled={busy} onchange={importProfiles}/></label>
                </div>
                <div class="config-status" role="status">{status}</div>
            </div>
        </Panel>
        {#if error}<div class="error" role="alert">{error}</div>{/if}
        <div class="help">LMB toggle&nbsp;&nbsp; RMB settings&nbsp;&nbsp; MMB bind</div>
    </div>
</ScaledClickGuiContent>

<style lang="scss">
  .clickgui {
    position: absolute;
    inset: 0;

    &.grid {
      background-image: linear-gradient(to right, var(--clickgui-grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--clickgui-grid-color) 1px, transparent 1px);
    }
  }
  .help {position: absolute; left: 50%; bottom: 112px; transform: translateX(-50%); white-space: nowrap; font-size: 13px; color: #e6e6e6; text-shadow: 1px 1px #000; pointer-events: none;}
  .error {position: absolute; bottom: 160px; width: 100%; text-align: center; color: #ff9090;}
  .configs {padding: 8px; color: #222; font-size: 14px;}
  .configs button, .configs input {font: inherit;}
  .profile-list {height: 178px; overflow: auto; padding: 4px; background: #ffffffa0; border-radius: 3px;}
  .profile-list button {display: block; width: 100%; border: 0; background: none; color: #111; padding: 3px; text-align: left; overflow: hidden; text-overflow: ellipsis; cursor: pointer;}
  .profile-list button.selected {background: var(--celestial-gradient); color: #fff;}
  .profile-input {width: 100%; border: 0; background: #ffffffbd; color: #111; padding: 5px; margin: 6px 0;}
  .config-actions {display: flex; gap: 5px; margin-bottom: 5px;}
  .config-actions button, .config-actions label {flex: 1; color: white; background: var(--celestial-gradient); border: 0; border-radius: 3px; padding: 4px 2px; cursor: pointer; text-align: center;}
  .config-actions button:disabled, .config-actions label.disabled {opacity: .5; cursor: default;}
  .config-actions input {position: absolute; opacity: 0; width: 0;}
  .config-status {min-height: 15px; font-size: 11px;}
</style>
