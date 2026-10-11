<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {mapToColor} from "../../../../util/color_utils";
    import {itemTextureUrl} from "../../../../integration/rest";

    export let stack: ItemStack;
    export let size = 32;

    $: ({count, damage, identifier, maxDamage, enchantments} = stack);

    $: enchanted = Object.keys(enchantments ?? {}).length > 0;
    $: countColor = count <= 0 ? "red" : "white";

    $: durability = maxDamage > 0 ? Math.min(1, Math.max(0, 1 - damage / maxDamage)) : 0;
    $: valueColor = mapToColor(120 * durability);
</script>

<div class="item-stack" style="--stack-size: {size}px; --stack-count-size: {Math.max(10, size * .4375)}px;">
    {#if enchanted}
        <div class="mask" style="mask-image: url({itemTextureUrl(identifier)})"></div>
    {/if}
    <img class="item-icon" src={itemTextureUrl(identifier)} alt={identifier}/>

    <div class="durability-bar" class:hidden={damage === 0 || maxDamage <= 0}>
        <div class="durability"
             style="width: {100 * durability}%; background-color: {valueColor}">
        </div>
    </div>

    <div class="count" class:hidden={count === 1 || identifier === "minecraft:air"} style="color: {countColor}">
        {count}
    </div>
</div>

<style lang="scss">

  .hidden {
    display: none;
  }

  .item-stack {
    position: relative;
    width: var(--stack-size);
    height: var(--stack-size);
  }

  .mask {
    position: absolute;
    background: radial-gradient(circle, var(--item-enchant-glow-start-color), var(--item-enchant-glow-end-color) 100%);
    mix-blend-mode: screen;
    scale: 105%;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    mask-size: cover;
  }

  .item-icon {
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    filter: drop-shadow(0 1px 2px #0008);
  }

  .durability-bar {
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 80%;
    height: 3px;
    border-radius: 2px;
    overflow: hidden;
    background-color: var(--item-damage-background-color);
  }

  .durability {
    height: 100%;
    transition: width 150ms;
  }

  .count {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: var(--stack-count-size);
    font-weight: bold;
    text-shadow: 1px 1px var(--item-count-shadow-color); // This is inconsistent with other UI elements but it looks better so I will let it pass ~Senk Ju
    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }
</style>
