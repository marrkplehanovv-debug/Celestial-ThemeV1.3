<script lang="ts">
    import {onMount, tick, onDestroy} from "svelte";
    import type {Module} from "../../../integration/types";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {getTextWidth} from "../../../integration/text_measurement";
    import {flip} from "svelte/animate";
    import {fly} from "svelte/transition";
    import {displayName, spaceSeperatedNames} from "../../../theme/theme_config";

    export let settings: { [name: string]: any };

    $: cSettings = {showTags: true, itemAlignment: "Right", order: "Descending", ...settings} as HudArrayListSettings;
    let request = 0;
    let initialized = false;

    let enabledModules: Module[] = [];

    async function updateEnabledModules() {
        const currentRequest = ++request;
        let modules: Module[];
        try {modules = await getModules();} catch {return;}
        if (currentRequest !== request) return;
        const visibleModules = modules.filter(m => m.enabled && !m.hidden);

        const modulesWithWidths = visibleModules.map(module => {
            const formattedName = displayName(module.name, $spaceSeperatedNames);

            return {
                ...module,
                width: getTextWidth(formattedName, "14px Celestial")
                    + (module.tag && cSettings.showTags ? getTextWidth(" " + module.tag, "12px Celestial") : 0)
            };
        });

        modulesWithWidths.sort((a, b) => cSettings.order === "Ascending" ? a.width - b.width : b.width - a.width);

        enabledModules = modulesWithWidths;
        await tick();
    }

    $: if (initialized && cSettings) updateEnabledModules();
    const unsubscribe = spaceSeperatedNames.subscribe(() => {if (initialized) updateEnabledModules();});
    onDestroy(unsubscribe);
    onMount(async () => {
        await document.fonts.ready;
        initialized = true;
    });

    listen("moduleToggle", async () => {
        await updateEnabledModules();
    });

    listen("refreshArrayList", async () => {
        await updateEnabledModules();
    });
</script>

<div class="arraylist" class:left={cSettings.itemAlignment === "Left"}>
    {#each enabledModules as {name, tag}, index (name)}
        <div
                class="module"
                style="--row-start: {100 - index / Math.max(1, enabledModules.length) * 70}%; --row-end: {100 - (index + 1) / Math.max(1, enabledModules.length) * 70}%; {cSettings.itemAlignment === 'Left' ? 'margin-right: auto;' : 'margin-left: auto;'}"
                animate:flip={{ duration: 200 }}
                transition:fly={{ x: cSettings.itemAlignment === "Left" ? -50 : 50, duration: 200 }}
        >
            {displayName(name, $spaceSeperatedNames)}
            {#if tag && cSettings.showTags}
                <span class="tag"> {tag}</span>
            {/if}
        </div>
    {/each}
</div>

<style lang="scss">

    .arraylist {filter: drop-shadow(0 0 7px color-mix(in srgb, var(--accent-color) 38%, transparent));}
    .module {
        --row-first: color-mix(in srgb, var(--accent-color) var(--row-start), var(--celestial-hud-secondary));
        --row-second: color-mix(in srgb, var(--accent-color) var(--row-end), var(--celestial-hud-secondary));
        background: linear-gradient(180deg, var(--row-first), var(--row-second));
        color: #f7f1fb;
        text-shadow: 1px 1px 2px #000b;
        font-size: 14px;
        line-height: 20px;
        padding: 0 8px;
        border-right: 2px solid #faffff;
        width: max-content;
        font-weight: 400;
    }
    .tag {color: #ded0ec; font-size: 12px;}
    .arraylist.left .module {border-right: 0; border-left: 2px solid #faffff;}

</style>
