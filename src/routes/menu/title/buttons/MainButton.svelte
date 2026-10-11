<script lang="ts">
    import {fade} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    export let title: string;
    export let index = 0;
    const dispatch = createEventDispatcher();
</script>

<button type="button" class="main-button" on:click={() => dispatch("click")} in:fade={{duration: 200, delay: index * 35}}>
    {title}
</button>

<style lang="scss">
    .main-button {position: relative; isolation: isolate; height: 40px; width: 100%; border: 1px solid #ffffff10; border-radius: 8px; background: #0f0f0f7d; box-shadow: 0 0 15px #000b; color: #e0e0e0; font: 500 16px "Celestial", sans-serif; text-shadow: 1px 1px 1px #0009; cursor: pointer; backdrop-filter: blur(8px); transition: color .2s, border-color .2s;}
    .main-button::before {content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 50%, transparent), color-mix(in srgb, var(--celestial-secondary) 50%, transparent)); transform: scaleX(0); opacity: 0; transition: transform .25s ease-out, opacity .25s ease-out;}
    .main-button:hover, .main-button:focus-visible {color: #ffffa0; border-color: color-mix(in srgb, var(--accent-color) 31%, transparent);}
    .main-button:hover::before, .main-button:focus-visible::before {transform: scaleX(1); opacity: 1;}
    .main-button:focus-visible {outline: 2px solid var(--accent-color); outline-offset: 2px;}
    .main-button:active {transform: translateY(1px);}
    @media (prefers-reduced-motion: reduce) {.main-button, .main-button::before {transition: none;}}
</style>
