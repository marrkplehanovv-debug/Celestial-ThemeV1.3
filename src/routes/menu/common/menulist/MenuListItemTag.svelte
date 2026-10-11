<script lang="ts">
    export let text: string;
</script>

<div class="tag">
    {text}
</div>

<style lang="scss">

  .tag {
    background-color: var(--menu-list-tag-background-color);
    color: var(--menu-text-color);
    font-size: 12px;
    padding: 3px 8px;
    border: 1px solid color-mix(in srgb, var(--accent-color) 19%, transparent);
    border-radius: 4px;
    margin-left: 0;
    transition: ease color .2s, ease background-color .2s;
  }
</style>
