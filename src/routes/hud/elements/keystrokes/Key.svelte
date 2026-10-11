<script lang="ts">
    import {listen} from "../../../../integration/ws";
    import type {KeyEvent} from "../../../../integration/events";
    import type {MinecraftKeybind} from "../../../../integration/types";

    export let gridArea: string;
    export let key: MinecraftKeybind | undefined;

    let active = false;

    listen("key", (e: KeyEvent) => {
        if (e.key !== key?.key.translationKey) {
            return;
        }

        active = e.action === 1 || e.action === -1;
    });
</script>

<div class="key" style="grid-area: {gridArea};" class:active>
    {key?.key.localized ?? "???"}
</div>

<style lang="scss">

    .key {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        border: 1px solid transparent;
        border-radius: 5px;
        background: var(--key-background, var(--celestial-inventory-surface)) padding-box, var(--celestial-hud-edge) border-box;
        box-shadow: var(--celestial-hud-shadow);
        color: var(--keystrokes-text-color);
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        text-shadow: 0 1px 2px #0008;
        transition: box-shadow .2s, color .2s;
    }
    .key.active {--key-background: var(--celestial-hud-gradient); color: #fff; box-shadow: 0 0 16px color-mix(in srgb, var(--accent-color) 40%, transparent);}

</style>
