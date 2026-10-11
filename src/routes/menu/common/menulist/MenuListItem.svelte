<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import RippleLoader from "../RippleLoader.svelte";

    export let image: string;
    export let imageText: string | null = null;
    export let imageTextBackgroundColor: string | null = null;
    export let title: string;
    export let favorite = false;

    const dispatch = createEventDispatcher();

    let previewImageLoaded = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="menu-list-item" on:dblclick={() => dispatch("dblclick")}>
    <div class="image">
        {#if !previewImageLoaded}
            <div class="loader">
                <RippleLoader />
            </div>
        {/if}
        <img class="preview" on:load={() => previewImageLoaded = true} src={image} alt="preview">
        <span class="text" class:visible={imageText !== null && imageTextBackgroundColor !== null}
              style="background-color: {imageTextBackgroundColor};">{imageText}</span>
        {#if favorite}
            <img class="favorite-mark" src="img/menu/icon-favorite-mark.svg" alt="fav">
        {/if}
    </div>
    <div class="title">
        <span class="text">{title}</span>
        <slot name="tag"/>
    </div>
    <div class="subtitle">
        <slot name="subtitle"/>
    </div>
    <div class="buttons">
        <div class="active">
            <slot name="active-visible"/>
        </div>

        <slot name="always-visible"/>
    </div>
</div>

<style lang="scss">

  .menu-list-item {
    display: grid;
    grid-template-areas:
        "a b c"
        "a d c";
    grid-template-columns: max-content minmax(0, 1fr) max-content;
    background-color: var(--menu-list-item-background-color);
    padding: 12px 16px;
    border: 1px solid #ffffff10;
    box-shadow: 0 2px 10px #0005;
    column-gap: 15px;
    border-radius: 5px;
    transition: ease background-color .2s;
    align-items: center;
    cursor: grab;

    &:hover, &:focus-within {
      background-color: var(--menu-list-item-hover-background-color);

      .subtitle {
        color: var(--menu-list-item-hover-subtitle-color);
      }

      .buttons .active {
        opacity: 1;
      }
    }
  }

  .image {
    grid-area: a;
    position: relative;

    .loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .preview {
      height: 48px;
      width: 48px;
      border-radius: 4px;
      image-rendering: pixelated;
    }

    .favorite-mark {
      position: absolute;
      top: 0;
      right: 0;
    }

    .text {
      position: absolute;
      bottom: 0;
      right: 0;
      display: none;
      color: var(--menu-text-color);
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 20px;

      &.visible {
        display: block;
      }
    }
  }

  .title {
    grid-area: b;
    align-self: flex-end;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;

    .text {
      font-size: 16px;
      color: var(--menu-text-color);
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .subtitle {
    grid-area: d;
    font-size: 14px;
    overflow-wrap: anywhere;
    color: var(--menu-text-dimmed-color);
    transition: ease color .2s;
    align-self: flex-start;
  }

  .buttons {
    grid-area: c;
    display: flex;

    .active {
      margin-right: 8px;
      opacity: 0;
      transition: ease opacity .2s;
    }
  }
</style>
