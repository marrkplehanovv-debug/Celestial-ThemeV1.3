<script lang="ts">
    import {createEventDispatcher} from "svelte";

    let value = "";

    const dispatch = createEventDispatcher<{
        search: { query: string }
    }>();
</script>

<input class="search" type="text" placeholder="Search..." bind:value={value}
       on:input={() => dispatch("search", {query: value})} spellcheck="false">

<style lang="scss">

  .search {
    background-color: var(--menu-search-background-color);
    border: none;
    color: var(--menu-text-color);
    font-family: inherit;
    font-size: 14px;
    border-radius: 5px;
    border-bottom: solid 2px var(--menu-search-border-color);
    background-image: url("/img/menu/icon-search.svg");
    background-repeat: no-repeat;
    background-position: 12px center;
    background-size: 16px;
    padding: 12px 12px 12px 38px;
    min-width: 140px;
    flex: 1;
  }
</style>