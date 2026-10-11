<script lang="ts">
    import {fly} from "svelte/transition";
</script>

<div class="option-bar" transition:fly|global={{duration: 700, x: 1000}}>
    <slot />
</div>

<style lang="scss">

    .option-bar {
      background-color: var(--menu-button-container-background-color);
      padding: 12px 16px;
      display: flex;
      border-radius: 5px;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      border: 1px solid #ffffff14;
      box-shadow: 0 0 15px #0009;
      backdrop-filter: blur(8px);
      margin-bottom: 16px;
    }
</style>