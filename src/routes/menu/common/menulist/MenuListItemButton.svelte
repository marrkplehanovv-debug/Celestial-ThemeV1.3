<script lang="ts">
    import ToolTip from "../ToolTip.svelte";
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;

    const dispatch = createEventDispatcher();
</script>

<button class="button" type="button" on:click={() => dispatch("click")}>
    <ToolTip text={title} color="black"/>
    <img class="icon" src="img/menu/icon-{icon}.svg" alt={icon}>
</button>

<style lang="scss">
  .button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    margin-left: 8px;
    padding: 5px;
    border-radius: 4px;
  }

  .button:hover, .button:focus-visible {background: color-mix(in srgb, var(--accent-color) 19%, transparent); outline: 1px solid color-mix(in srgb, var(--accent-color) 38%, transparent);}
  .icon {
    height: 22px;
    width: 22px;
  }
</style>