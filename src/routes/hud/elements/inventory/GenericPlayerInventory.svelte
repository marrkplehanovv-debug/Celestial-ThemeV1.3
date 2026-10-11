<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {listen} from "../../../../integration/ws";
    import type {ClientPlayerInventoryEvent, PlayerInventory} from "../../../../integration/events";
    import ItemStackView from "./ItemStackView.svelte";
    import {onMount} from "svelte";
    import {getPlayerInventory} from "../../../../integration/rest";

    export let rowLength: number;
    export let backgroundColor: string = "var(--inventory-background-color)";
    export let gap: string = "0.5rem";
    export let getRenderedStacks: (inventory: PlayerInventory) => ItemStack[];

    let inventory: PlayerInventory | undefined;
    let stacks: ItemStack[] = [];

    listen("clientPlayerInventory", (data: ClientPlayerInventoryEvent) => {
        inventory = data.inventory;
    });

    onMount(async () => {
        try {inventory = await getPlayerInventory();} catch { /* Wait for inventory events outside a world. */ }
    });

    $: stacks = inventory ? getRenderedStacks(inventory) : [];
</script>

<div class="inventory" class:transparent={backgroundColor === "transparent"} style="
    --inventory-background: {backgroundColor};
    gap: {gap};
    --row-length: {rowLength};
">
    {#each stacks as stack (stack)}
        <ItemStackView {stack}/>
    {/each}
</div>

<style lang="scss">

    .inventory {
        display: grid;
        grid-template-columns: repeat(var(--row-length), 32px);
        padding: 6px;
        border: 1px solid transparent;
        border-radius: 5px;
        background: var(--celestial-inventory-surface) padding-box, var(--celestial-hud-edge) border-box;
        box-shadow: var(--celestial-hud-shadow);
    }
    .inventory.transparent {padding: 0; border-color: transparent; background: none; box-shadow: none;}

</style>
