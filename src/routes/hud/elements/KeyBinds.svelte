<script lang="ts">
    import {onMount} from "svelte";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {displayName, spaceSeperatedNames, sortByWidth} from "../../../theme/theme_config";
    import type {Module} from "../../../integration/types";
    import {UNKNOWN_KEY} from "../../../util/utils";
    import BindDisplay from "../../clickgui/setting/bind/BindDisplay.svelte";

    let modules: Module[] = $state([]);

    async function updateModulesWithBinds() {
        try {modules = sortByWidth((await getModules()).filter(m => m.keyBind.boundKey !== UNKNOWN_KEY), $spaceSeperatedNames, "14px Celestial");} catch { /* Keep the last known binds until the next client event. */ }
    }

    listen("moduleToggle", updateModulesWithBinds);
    listen("valueChanged", async (e) => {
        if (e.value.name === "Bind") {
            await updateModulesWithBinds();
        }
    })

    onMount(async () => {
        await updateModulesWithBinds();
    });
</script>

<div class="keybinds">
    <div class="header">
        <span class="title">Keybinds</span>
    </div>
    <div class="entries">
        {#each modules as m (m.name)}
            <div class="row" class:enabled={m.enabled}>
                <span class="module-name">{displayName(m.name, $spaceSeperatedNames)}</span>
                <span class="key-bind" class:muted={!m.enabled}>
                    [<BindDisplay boundKey={m.keyBind.boundKey} modifiers={m.keyBind.modifiers}/>]
                </span>
            </div>
        {:else}
            <div class="no-binds"><img src="img/hud/keyboard.png" alt=""/><div><span>Список пуст</span><small>Нет назначенных биндов!</small></div></div>
        {/each}
    </div>
</div>

<style lang="scss">

    .keybinds {
        position: relative;
        width: max-content;
        min-width: 204px;
        max-width: 330px;
        padding-top: 4px;
        border: 1px solid transparent;
        border-radius: 6px;
        background: var(--celestial-inventory-surface) padding-box, var(--celestial-hud-edge) border-box;
        box-shadow: var(--celestial-hud-shadow);
        color: var(--celestial-hud-text);
    }
    .keybinds::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 3px;
        border-radius: 6px 6px 0 0;
        background: var(--celestial-hud-gradient);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 60%, transparent);
    }
    .header {display: flex; justify-content: center; align-items: center; padding: 4px 10px 5px;}
    .title {font-size: 18px; letter-spacing: -.3px; text-shadow: 0 1px 2px #0008;}
    .entries {padding: 0 10px 8px; min-height: 38px;}
    .row {display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 22px;}
    .module-name {font-size: 14px; min-width: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
    .key-bind {display: inline-flex; align-items: center; font-size: 13px; color: var(--celestial-hud-light); white-space: nowrap; flex-shrink: 0;}
    .key-bind.muted {color: var(--celestial-hud-muted);}
    .no-binds {display: flex; align-items: center; gap: 8px; padding: 5px 0;}
    .no-binds img {width: 32px; height: 30px; opacity: .9;}
    .no-binds span {display: block; font-size: 17px; line-height: 21px;}
    .no-binds small {display: block; color: var(--celestial-hud-muted); font-size: 10px; margin-top: 3px;}

</style>
