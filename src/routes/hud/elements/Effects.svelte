<script lang="ts">
    import {onMount} from "svelte";
    import {effectTime} from "../../../theme/theme_config";
    import {getPlayerData, effectTextureUrl} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import type {ClientPlayerDataEvent, ClientPlayerEffectEvent} from "../../../integration/events";
    import type {StatusEffect} from "../../../integration/types";

    export let inEditor = false;
    let effects: StatusEffect[] = [];
    let updated = false;
    onMount(async () => {
        try {const player = await getPlayerData(); if (!updated) effects = player.effects;} catch { /* Wait for player events outside a world. */ }
    });

    listen("clientPlayerData", (event: ClientPlayerDataEvent) => {
        updated = true;
        effects = event.playerData.effects;
    });

    listen("clientPlayerEffect", (event: ClientPlayerEffectEvent) => {
        updated = true;
        effects = event.effects;
    });

    function formatAmplifier(n: number): string {
        return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] ?? (n + 1).toString();
    }
</script>

{#if effects.length > 0 || inEditor}
    <div class="effects">
        {#each effects as e (e.effect)}
            <div class="effect">
                <img class="effect-icon" src={effectTextureUrl(e.effect)} alt={e.localizedName}/>
                <div class="text"><span class="name">{e.localizedName}  <span
                        class="amplifier">{formatAmplifier(e.amplifier)}</span></span>
                <span class="duration">{effectTime(e.duration, e.infinite)}</span></div>
            </div>
        {:else}<div class="effect editor-placeholder">Potions</div>{/each}
    </div>
{/if}

<style lang="scss">

    .effects {display: flex; flex-direction: column; align-items: flex-start; gap: 8px;}
    .effect {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 54px;
        padding: 7px 12px 7px 10px;
        border: 1px solid transparent;
        border-radius: 5px;
        background: var(--celestial-inventory-surface) padding-box, var(--celestial-hud-edge) border-box;
        box-shadow: var(--celestial-hud-shadow);
        font-size: 14px;
    }
    .effect::before {content: ""; position: absolute; top: 7px; bottom: 7px; left: -1px; width: 2px; border-radius: 2px; background: var(--celestial-hud-gradient);}
    .effect-icon {width: 34px; height: 34px; image-rendering: pixelated; filter: drop-shadow(0 0 5px color-mix(in srgb, var(--accent-color) 25%, transparent));}
    .text {display: flex; flex-direction: column; gap: 4px; min-width: 0;}
    .name {color: var(--celestial-hud-text); white-space: nowrap; text-shadow: 0 1px 2px #0008;}
    .amplifier {color: var(--celestial-hud-light); font-size: 12px;}
    .duration {font-size: 13px; color: var(--celestial-hud-muted); font-variant-numeric: tabular-nums;}
    .editor-placeholder {color: var(--celestial-hud-text); min-width: 170px;}

</style>
