<script lang="ts">
    import Header from "./header/Header.svelte";
    import {fly} from "svelte/transition";
    import {onMount} from "svelte";

    const transitionDuration = 700; // TODO: suboptimal

    let ready = false;
    const wallpaperUrl = new URL("backgrounds/background.png", document.baseURI).href;

    onMount(() => {
        const timeout = window.setTimeout(() => {ready = true;}, transitionDuration);
        return () => window.clearTimeout(timeout);
    });
</script>

<div class="menu" style='--celestial-menu-wallpaper: url("{wallpaperUrl}")'>
    {#if ready}
        <div transition:fly|global={{duration: 700, y: -100}}>
            <Header/>
        </div>
    {/if}

    <div class="menu-wrapper">
        <slot/>
    </div>
</div>

<style lang="scss">

    .menu {padding: 24px; display: flex; flex-direction: column; position: fixed; inset: 0; background-image: var(--celestial-menu-wallpaper); background-color: #080808; background-size: 100% 100%; background-position: center; font-family: "Celestial", "Inter", sans-serif; color: #e0e0e0;}
    .menu {--menu-button-container-background-color: #0f0f0f85; --menu-list-item-background-color: #0a0a0a80; --menu-list-item-hover-background-color: color-mix(in srgb, var(--accent-color) 15%, transparent); --menu-list-tag-background-color: color-mix(in srgb, var(--accent-color) 19%, transparent); --menu-search-background-color: #0f0f0f9c; --menu-search-border-color: color-mix(in srgb, var(--accent-color) 38%, transparent); --menu-icon-text-button-background-color: #0f0f0f7d; --menu-icon-text-button-accent-color: color-mix(in srgb, var(--accent-color) 33%, transparent); --menu-icon-text-button-icon-background-color: #ffffff08; --menu-text-color: #e0e0e0; --menu-text-dimmed-color: #b4acbd;}
    .menu::before {content: ""; position: fixed; inset: 0; background: linear-gradient(to bottom, transparent 53%, #090310a8); pointer-events: none; z-index: 0;}
    .menu > div {position: relative; z-index: 1;}
    .menu > div:first-child {z-index: 2;}
    .menu-wrapper {flex: 1; min-height: 0; display: flex; flex-direction: column;}
    @media (max-width: 760px) {.menu {padding: 16px;}}

</style>
