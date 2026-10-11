<script context="module" lang="ts">
    let nextGradientId = 0;
</script>

<script lang="ts">
    import {onMount, onDestroy} from "svelte";
    import {listen} from "../../../../integration/ws";
    import type {PlayerData} from "../../../../integration/types";
    import {REST_BASE} from "../../../../integration/host";
    import ItemStackView from "../inventory/ItemStackView.svelte";
    import {getPlayerData} from "../../../../integration/rest";
    import {fly} from "svelte/transition";
    import {healthFraction} from "../../../../theme/theme_config";

    export let settings: {[name: string]: unknown} = {};
    export let inEditor = false;
    const gradientId = `celestial-health-${nextGradientId++}`;
    let target: PlayerData | null = null;
    let player: PlayerData | null = null;
    let visible = false;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;
    $: entity = visible && target ? target : inEditor ? player : null;
    $: fraction = entity ? healthFraction(entity.actualHealth, entity.maxHealth) : 0;
    $: percentage = fraction * 100;
    $: ring = settings.style === "Ring";

    listen("targetChange", event => {
        clearTimeout(hideTimeout);
        if (event.target) {
            target = event.target;
            visible = true;
            hideTimeout = setTimeout(() => visible = false, 1000);
        } else {
            hideTimeout = setTimeout(() => visible = false, 500);
        }
    });
    listen("clientPlayerData", event => player = event.playerData);
    onMount(async () => {
        if (!inEditor) return;
        try {player = await getPlayerData();} catch { /* The editor remains usable outside a world. */ }
    });
    onDestroy(() => clearTimeout(hideTimeout));
</script>

{#if entity || inEditor}
    <div class="targethud" class:ring transition:fly={{y: -10, duration: 180}}>
        <div class="avatar">
            {#if entity}<img src="{REST_BASE}/api/v1/client/resource/skin?uuid={encodeURIComponent(entity.uuid)}" alt={entity.username} on:error={event => (event.currentTarget as HTMLImageElement).hidden = true} on:load={event => (event.currentTarget as HTMLImageElement).hidden = false}/><img class="hat" src="{REST_BASE}/api/v1/client/resource/skin?uuid={encodeURIComponent(entity.uuid)}" alt="" on:error={event => (event.currentTarget as HTMLImageElement).hidden = true} on:load={event => (event.currentTarget as HTMLImageElement).hidden = false}/>{/if}
        </div>
        <div class="details">
            <div class="name">{entity?.username ?? "Target HUD"}</div>
            {#if ring}
                <div class="subtitle">Health: {entity ? entity.actualHealth.toFixed(1) : "—"}{#if entity?.absorption} +{entity.absorption.toFixed(1)}{/if}</div>
            {:else}
                <div class="held-items">
                    {#each [entity?.mainHandStack, entity?.offHandStack].filter(item => item && item.count > 0) as stack}
                        {#if stack}<ItemStackView {stack} size={22}/>{/if}
                    {/each}
                </div>
                <div class="health-bar" role="progressbar" aria-label="Target health" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
                    <div class="health" style:width={`${fraction * 100}%`}></div><span class="percentage">{percentage.toFixed(1)}%</span>
                </div>
            {/if}
        </div>
        {#if !ring && entity}
            <div class="armor-items">
                {#each [3, 2, 1, 0] as index}
                    <div class="armor-slot">{#if entity.armorItems[index]?.count > 0}<ItemStackView stack={entity.armorItems[index]}/>{/if}</div>
                {/each}
            </div>
        {/if}
        {#if ring}
            <div class="health-ring">
                <svg viewBox="0 0 40 40" role="progressbar" aria-label="Target health" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
                    <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--celestial-hud-light)"/><stop offset=".5" stop-color="var(--accent-color)"/><stop offset="1" stop-color="var(--celestial-hud-secondary)"/></linearGradient></defs>
                    <circle class="ring-track" cx="20" cy="20" r="16"/>
                    <circle class="ring-value" stroke={`url(#${gradientId})`} cx="20" cy="20" r="16" pathLength="100" stroke-dasharray={`${percentage} 100`}/>
                </svg>
                <span>{Math.round(percentage)}%</span>
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">

    .targethud {
        position: relative;
        width: 260px;
        height: 88px;
        padding: 11px;
        border: 1px solid transparent;
        border-radius: 7px;
        background: var(--celestial-hud-surface) padding-box, var(--celestial-hud-edge) border-box;
        box-shadow: var(--celestial-hud-shadow);
        color: var(--celestial-hud-text);
    }
    .targethud::before {content: ""; position: absolute; top: -1px; left: 12px; right: 12px; height: 2px; border-radius: 2px; background: var(--celestial-hud-gradient);}
    .avatar {position: relative; width: 64px; height: 64px; border-radius: 5px; overflow: hidden; image-rendering: pixelated; background: url("/img/steve.png") center / cover; box-shadow: 0 0 9px #0006;}
    .avatar img {position: absolute; width: 512px; height: 512px; max-width: none; left: -64px; top: -64px;}
    .avatar .hat {left: -320px;}
    .details {position: absolute; left: 80px; top: 13px; width: 106px; height: 61px;}
    .name {max-width: 102px; font-size: 15px; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px #0009;}
    .held-items {display: flex; position: absolute; top: 22px; left: 0; gap: 4px;}
    .health-bar {position: absolute; left: 0; bottom: 0; width: 106px; height: 17px; padding: 2px; border: 1px solid #ffffff12; border-radius: 3px; overflow: hidden; background: #1a1421;}
    .health {height: 100%; border-radius: 1px; background: var(--celestial-hud-gradient); transition: width 180ms ease-out;}
    .percentage {position: absolute; inset: 0; display: grid; place-items: center; font-size: 11px; font-variant-numeric: tabular-nums; color: #f8f0ff; text-shadow: 1px 1px #000b;}
    .armor-items {position: absolute; right: 7px; top: 11px; display: grid; grid-template-columns: repeat(2, 32px); gap: 1px;}
    .armor-slot {width: 32px; height: 32px; border-radius: 3px; background: #ffffff04;}
    .ring {width: 276px;}
    .ring .details {width: 108px; top: 21px; height: auto;}
    .subtitle {font-size: 12px; color: var(--celestial-hud-muted); margin-top: 6px; line-height: 17px;}
    .health-ring {position: absolute; right: 10px; top: 9px; width: 68px; height: 68px; filter: drop-shadow(0 0 4px color-mix(in srgb, var(--accent-color) 30%, transparent));}
    .health-ring svg {width: 100%; height: 100%; transform: rotate(-90deg);}
    circle {fill: none; stroke-width: 3;}
    .ring-track {stroke: #ffffff12;}
    .ring-value {stroke-linecap: round; transition: stroke-dasharray 180ms;}
    .health-ring span {position: absolute; inset: 0; display: grid; place-items: center; font-size: 13px; font-variant-numeric: tabular-nums;}

</style>
