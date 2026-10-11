<script lang="ts">
    import {onMount, onDestroy} from "svelte";
    import type {Module as TModule} from "../../integration/types";
    import {listen} from "../../integration/ws";
    import Module from "./Module.svelte";
    import {panelPosition, sortAlphabetically, spaceSeperatedNames} from "../../theme/theme_config";
    import type {KeyboardKeyEvent, ModuleToggleEvent} from "../../integration/events";
    import {fade} from "svelte/transition";
    import {quintOut} from "svelte/easing";
    import {
        gridSize,
        highlightModuleName,
        maxPanelZIndex,
        scaleFactor,
        showGrid,
        snappingEnabled
    } from "./clickgui_store";
    import {setItem} from "../../integration/persistent_storage";

    export let category: string;
    export let modules: TModule[];
    export let panelIndex: number;
    export let compact = false;
    $: sortedModules = sortAlphabetically(modules, $spaceSeperatedNames);

    let panelElement: HTMLElement;
    let modulesElement: HTMLElement;
    let expandButtonElement: HTMLElement;

    let moving = false;
    let offsetX = 0;
    let offsetY = 0;

    let scrollPositionSaveTimeout: number | undefined;

    const panelConfig = loadPanelConfig();

    let ignoreGrid = false;

    interface PanelConfig {
        top: number;
        left: number;
        expanded: boolean;
        scrollTop: number;
        zIndex: number;
    }


    function clamp(number: number, min: number, max: number) {
        return Math.max(min, Math.min(number, Math.max(min, max)));
    }

    function loadPanelConfig(): PanelConfig {
        const localStorageItem = localStorage.getItem(
            `celestial.panel.${category}`,
        );

        if (!localStorageItem) {
            return {
                ...panelPosition(panelIndex, document.documentElement.clientWidth * 2 / $scaleFactor),
                expanded: true,
                scrollTop: 0,
                zIndex: 0
            };
        } else {
            let config: PanelConfig;
            try {config = JSON.parse(localStorageItem);} catch {return {...panelPosition(panelIndex, document.documentElement.clientWidth * 2 / $scaleFactor), expanded: true, scrollTop: 0, zIndex: 0};}

            // Migration
            if (!config.zIndex) {
                config.zIndex = 0;
            }

            if (config.zIndex > $maxPanelZIndex) {
                $maxPanelZIndex = config.zIndex;
            }

            return config;
        }
    }

    async function savePanelConfig() {
        await setItem(
            `celestial.panel.${category}`,
            JSON.stringify(panelConfig),
        );
    }

    function fixPosition() {
        panelConfig.left = clamp(panelConfig.left, 0, document.documentElement.clientWidth * (2 / $scaleFactor) - panelElement.offsetWidth);
        panelConfig.top = clamp(panelConfig.top, 0, document.documentElement.clientHeight * (2 / $scaleFactor) - panelElement.offsetHeight);
    }

    function onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;

        moving = true;
        offsetX = e.clientX * (2 / $scaleFactor) - panelConfig.left;
        offsetY = e.clientY * (2 / $scaleFactor) - panelConfig.top;
        panelConfig.zIndex = ++$maxPanelZIndex;

        $showGrid = $snappingEnabled && !expandButtonElement.contains(e.target as HTMLElement);
    }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            const newLeft = (e.clientX * (2 / $scaleFactor) - offsetX);
            const newTop = (e.clientY * (2 / $scaleFactor) - offsetY);

            panelConfig.left = snapToGrid(newLeft);
            panelConfig.top = snapToGrid(newTop);

            fixPosition();
        }
    }

    function onMouseUp() {
        if (moving) {
            savePanelConfig();
        }
        moving = false;
        $showGrid = false;
    }

    function toggleExpanded() {
        panelConfig.expanded = !panelConfig.expanded;

        savePanelConfig();
    }

    /**
     * The panel only reaches its new height once the `max-height` transition of the module
     * list has finished, so the position can only be clamped here. Doing it right after the
     * toggle would measure the height the panel had *before* it was expanded or collapsed.
     */
    function handleModulesTransitionEnd(e: TransitionEvent) {
        if (e.target !== modulesElement || e.propertyName !== "max-height") {
            return;
        }

        const {left, top} = panelConfig;

        fixPosition();

        if (panelConfig.left !== left || panelConfig.top !== top) {
            savePanelConfig();
        }
    }

    function handleModulesScroll() {
        panelConfig.scrollTop = modulesElement.scrollTop;

        if (scrollPositionSaveTimeout !== undefined) {
            clearTimeout(scrollPositionSaveTimeout);
        }
        scrollPositionSaveTimeout = setTimeout(() => {
            savePanelConfig();
        }, 500)
    }

    const unsubscribeHighlight = highlightModuleName.subscribe((name) => {
        const highlightModule = modules.find(
            (m) => m.name === name,
        );
        if (highlightModule) {
            panelConfig.zIndex = ++$maxPanelZIndex;
            panelConfig.expanded = true;
            savePanelConfig();
        }
    });
    onDestroy(() => {
        unsubscribeHighlight();
        clearTimeout(scrollPositionSaveTimeout);
    });

    listen("moduleToggle", (e: ModuleToggleEvent) => {
        const moduleName = e.moduleName;
        const moduleEnabled = e.enabled;

        const mod = modules.find((m) => m.name === moduleName);
        if (!mod) return;

        mod.enabled = moduleEnabled;
        modules = modules;
    });

    onMount(() => {
        if (!modulesElement) {
            return;
        }

        modulesElement.scrollTo({
            top: panelConfig.scrollTop,
            behavior: "smooth"
        });
    });

    listen("keyboardKey", (e: KeyboardKeyEvent) => {
        if (e.key === "key.keyboard.left.shift") {
            ignoreGrid = e.action === 1;
        }
    });

    function snapToGrid(value: number): number {
        if (ignoreGrid || !$snappingEnabled) return value;

        return Math.round(value / $gridSize) * $gridSize;
    }
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove}/>

<div
        class="panel"
        class:compact
        style="left: {panelConfig.left}px; top: {panelConfig.top}px; z-index: {panelConfig.zIndex};"
        bind:this={panelElement}
        transition:fade|global={{duration: 200, easing: quintOut}}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
            class="title"
            on:mousedown={onMouseDown}
            on:contextmenu|preventDefault={toggleExpanded}
    >
        <span class="category">{category}</span>

        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button class="expand-toggle" on:click={toggleExpanded} bind:this={expandButtonElement}>
            <div class="icon" class:expanded={panelConfig.expanded}></div>
        </button>
    </div>

    <div
            class="modules"
            class:expanded={panelConfig.expanded}
            on:scroll={handleModulesScroll}
            on:transitionend={handleModulesTransitionEnd}
            bind:this={modulesElement}
    >
        {#each sortedModules as {name, enabled, description} (name)}
            <Module {name} {enabled} {description}/>
        {/each}
        <slot/>
    </div>
</div>

<style lang="scss">

  .panel {
    border-radius: 5px;
    width: 220px;
    position: absolute;
    overflow: hidden;
    box-shadow: 0 0 15px #ffffff7d;
    will-change: transform;
    transition: none;
    user-select: none;
  }

  .title {
    display: grid;
    grid-template-columns: 1fr max-content;
    align-items: center;
    column-gap: 12px;
    background: var(--celestial-gradient);
    border-bottom: none;
    height: 34px;
    padding: 0 12px;
    cursor: grab;

    .category {
      font-size: 19px;
      color: white;
      font-weight: 400;
      text-align: center;
      text-shadow: 1px 1px #0005;
    }
  }

  .modules {
    transition: max-height 300ms ease;
    scroll-behavior: smooth;
    max-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--celestial-panel-body);

    &.expanded {
      height: 466px;
      max-height: 466px;
      padding: 2px 0 4px;;
    }

    &::-webkit-scrollbar {
      width: 2px;
      height: 2px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
    }
  }

  .expand-toggle {
    background-color: transparent;
    border: none;
    cursor: pointer;

    .icon {
      height: 12px;
      width: 12px;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        background-color: var(--clickgui-panel-toggle-icon-color);
        transition: transform 0.4s ease-out;
        top: 0;
        left: 50%;
        width: 2px;
        height: 100%;
        margin-left: -1px;
      }

      &::after {
        content: "";
        position: absolute;
        background-color: var(--clickgui-panel-toggle-icon-color);
        transition: transform 0.4s ease-out;
        top: 50%;
        left: 0;
        width: 100%;
        height: 2px;
        margin-top: -1px;
      }

      &.expanded {
        &::before {
          transform: rotate(90deg);
        }

        &::after {
          transform: rotate(180deg);
        }
      }
    }
  }
.panel.compact .modules.expanded {height: 302px; max-height: 302px;}
</style>
