<script lang="ts">
    export let vertical = false;
</script>

<div class="button-container" class:vertical>
    <slot />
</div>

<style lang="scss">

    .button-container {
      background-color: var(--menu-button-container-background-color);
      padding: 8px 12px;
      width: max-content;
      max-width: 100%;
      flex-wrap: wrap;
      border: 1px solid #ffffff14;
      box-shadow: 0 0 15px #0009;
      backdrop-filter: blur(8px);
      border-radius: 5px;
      display: flex;
      column-gap: 8px;

      &.vertical {
        flex-direction: column;
        row-gap: 20px;
        padding: 30px 15px;
      }
    }
</style>
