<script lang="ts">
    import ToolTip from "../ToolTip.svelte";
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="icon-button" on:click={() => dispatch("click")}>
    <ToolTip text={title}/>

    <div class="icon">
        <img src="img/menu/icon-{icon}.svg" alt={icon}>
    </div>
</div>

<style lang="scss">
  .icon-button {
    position: relative;
  }

  .icon img {max-width: 22px; max-height: 22px;}
  .icon:hover {background: color-mix(in srgb, var(--accent-color) 19%, transparent); border-radius: 4px;}
  .icon {
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>