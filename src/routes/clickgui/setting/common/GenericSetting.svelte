<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ModuleSetting, FloatSetting as NumericSetting, ChooseSetting as ModeSetting, ChoiceSetting as BranchSetting, MultiChooseSetting as MultiModeSetting} from "../../../../integration/types";
    import FloatRangeSetting from "../FloatRangeSetting.svelte";
    import IntRangeSetting from "../IntRangeSetting.svelte";
    import ColorSetting from "../ColorSetting.svelte";
    
    import BindSetting from "../bind/BindSetting.svelte";
    import VectorSetting from "../VectorSetting.svelte";
    import KeySetting from "../KeySetting.svelte";
    import FileSetting from "../FileSetting.svelte";
    import MutableListSetting from "../list/MutableListSetting.svelte";
    import ItemListSetting from "../list/ItemListSetting.svelte";
    import RegistryListSetting from "../list/RegistryListSetting.svelte";
    import CurveSetting from "../CurveSetting.svelte";
    import RegistryMutableListSetting from "../list/RegistryMutableListSetting.svelte";
    import {spaceSeperatedNames} from "../../../../theme/theme_config";
    import {displayName} from "../../../../theme/theme_config";

    export let setting: ModuleSetting;
    export let path: string;
    const dispatch = createEventDispatcher();
    let open = false;
    $: label = displayName(setting.name, $spaceSeperatedNames);
    $: numeric = setting as NumericSetting;
    $: chosen = setting as ModeSetting;
    $: choice = setting as BranchSetting;
    $: multiple = setting as MultiModeSetting;
    $: children = setting.valueType === "CHOICE" ? (choice.choices[choice.active]?.value as ModuleSetting[] ?? []) : Array.isArray(setting.value) ? setting.value as ModuleSetting[] : [];
    $: toggle = children.find(child => child.name === "Enabled");

    function change(value: unknown) {
        setting = {...setting, value} as ModuleSetting;
        dispatch("change");
    }

    function select(value: string) {
        change(value);
        open = false;
    }

    function multiSelect(value: string) {
        const selected = multiple.value.includes(value);
        if (selected && !multiple.canBeNone && multiple.value.length === 1) return;
        change(selected ? multiple.value.filter(item => item !== value) : [...multiple.value, value]);
    }

    function selectChoice(active: string) {
        setting = {...choice, active};
        dispatch("change");
        open = false;
    }

    function updateChildren(value: ModuleSetting[]) {
        if (setting.valueType === "CHOICE") {
            const active = choice.active;
            setting = {...choice, choices: {...choice.choices, [active]: {...choice.choices[active], value}}};
            dispatch("change");
        } else change(value);
    }

    function step(value: NumericSetting) {
        if (setting.valueType === "INT") return 1;
        return value.range.to <= 0.1 ? 0.0001 : value.range.to <= 1 ? 0.001 : value.range.to > 100 ? 0.1 : 0.01;
    }
</script>

{#if setting.valueType === "BOOLEAN"}
    <label class="boolean setting-row">
        <span>{label}</span>
        <input aria-label={label} type="checkbox" checked={Boolean(setting.value)} on:change={e => change(e.currentTarget.checked)}/>
        <span class="switch" class:checked={Boolean(setting.value)}></span>
    </label>
{:else if setting.valueType === "INT" || setting.valueType === "FLOAT"}
    <div class="number setting-row">
        <label for={`${path}.${setting.name}`}>{label}{numeric.suffix ? ` (${numeric.suffix})` : ""}</label>
        <div class="track">
            <span>{numeric.range.from}</span>
            <input id={`${path}.${setting.name}`} aria-label={label} type="range" min={Math.min(numeric.range.from, numeric.value)} max={Math.max(numeric.range.to, numeric.value)} step={step(numeric)} value={numeric.value} on:input={e => {setting = {...numeric, value: Number(e.currentTarget.value)};}} on:change={() => dispatch("change")}/>
            <span>{numeric.range.to}</span>
        </div>
        <input class="numeric-value" aria-label={`${label} value`} type="number" step={step(numeric)} value={numeric.value} on:change={e => {if (e.currentTarget.value !== "") change(Number(e.currentTarget.value));}}/>
    </div>
{:else if setting.valueType === "CHOOSE" || setting.valueType === "CHOICE"}
    <div class="mode setting-row">
        <span>{label}:</span>
        <button class="selected" aria-label={label} aria-expanded={open} on:click={() => open = !open}>{setting.valueType === "CHOICE" ? choice.active : chosen.value}<span class:open>⌄</span></button>
        {#if open}
            <div class="options">
                {#each setting.valueType === "CHOICE" ? Object.keys(choice.choices) : chosen.choices as option}
                    <button class:active={option === (setting.valueType === "CHOICE" ? choice.active : chosen.value)} on:click={() => setting.valueType === "CHOICE" ? selectChoice(option) : select(option)}>{option}</button>
                {/each}
            </div>
        {/if}
        {#if setting.valueType === "CHOICE"}
            {#each children as child, index (child.name)}
                <svelte:self path={`${path}.${setting.name}`} bind:setting={children[index]} on:change={() => updateChildren(children)}/>
            {/each}
        {/if}
    </div>
{:else if setting.valueType === "MULTI_CHOOSE"}
    <div class="mode setting-row">
        <button class="group-title" aria-expanded={open} on:click={() => open = !open}>{label}: {multiple.value.length}<span>⌄</span></button>
        {#if open}
            <div class="options multi">
                {#each multiple.choices as option}
                    <button class:active={multiple.value.includes(option)} aria-pressed={multiple.value.includes(option)} on:click={() => multiSelect(option)}>{option}</button>
                {/each}
            </div>
        {/if}
    </div>
{:else if setting.valueType === "TEXT"}
    <label class="text setting-row"><span>{label}</span><input aria-label={label} type="text" value={String(setting.value)} on:change={e => change(e.currentTarget.value)}/></label>
{:else if setting.valueType === "CONFIGURABLE" || setting.valueType === "TOGGLEABLE"}
    <div class="group setting-row">
        <button class="group-title" aria-expanded={open} on:click={() => open = !open}>{label}<span>⌄</span></button>
        {#if toggle}
            <svelte:self {path} bind:setting={toggle} on:change={() => updateChildren(children.map(child => child.name === "Enabled" ? toggle! : child))}/>
        {/if}
        {#if open}
            {#each children as child, index (child.name)}
                {#if child.name !== "Enabled"}
                    <svelte:self path={`${path}.${setting.name}`} bind:setting={children[index]} on:change={() => updateChildren(children)}/>
                {/if}
            {/each}
        {/if}
    </div>
{:else}
    <div class="native-setting">
    {#if setting.valueType === "FILE"}
        <FileSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "INT_RANGE"}
        <IntRangeSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "FLOAT_RANGE"}
        <FloatRangeSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "COLOR"}
        <ColorSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "MUTABLE_LIST" }
        <MutableListSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "ITEM_LIST" }
        <ItemListSetting {path} bind:setting={setting} on:change/>
    {:else if setting.valueType === "REGISTRY_LIST" }
        <RegistryListSetting {path} bind:setting={setting} on:change/>
    {:else if setting.valueType === "REGISTRY_MUTABLE_LIST" }
        <RegistryMutableListSetting {path} bind:setting={setting} on:change/>
    {:else if setting.valueType === "BIND"}
        <BindSetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "VECTOR3_I" }
        <VectorSetting vecAxes={["x", "y", "z"]} step={1} bind:setting={setting} on:change/>
    {:else if setting.valueType === "VECTOR3_D" }
        <VectorSetting vecAxes={["x", "y", "z"]} step={0.01} bind:setting={setting} on:change/>
    {:else if setting.valueType === "VECTOR2_F" }
        <VectorSetting vecAxes={["x", "y"]} step={0.01} bind:setting={setting} on:change/>
    {:else if setting.valueType === "KEY"}
        <KeySetting bind:setting={setting} on:change/>
    {:else if setting.valueType === "CURVE"}
        <CurveSetting {path} bind:setting={setting} on:change/>
    {:else}
        <div style="color: var(--clickgui-text-color)">Unsupported setting {setting.valueType}</div>
    {/if}
</div>
{/if}

<style lang="scss">
    .setting-row, .native-setting {--clickgui-text-color: #ffffff; --clickgui-text-dimmed-color: #d3d3d3; color: #ffffff;}
    .setting-row {font-size: 14px; width: 100%;}
    button, input {font: inherit; color: inherit;}
    button {cursor: pointer; border: 0;}
    button:focus-visible, input:focus-visible {outline: 2px solid var(--accent-color); outline-offset: 2px;}
    .boolean {display: flex; align-items: center; justify-content: space-between; gap: 4px; min-height: 44px; padding: 7px 6px 18px; position: relative; cursor: pointer;}
    .boolean > span:first-child {max-width: 145px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
    .boolean input {position: absolute; right: 6px; width: 36px; height: 22px; opacity: 0; cursor: pointer;}
    .switch {width: 36px; height: 16px; border-radius: 8px; background: #7c939b; box-shadow: 0 0 12px #0008; flex-shrink: 0; pointer-events: none;}
    .switch::after {content: ""; display: block; width: 15px; height: 15px; border-radius: 50%; background: white; transition: transform 180ms;}
    .switch.checked {background: var(--celestial-gradient);}
    .switch.checked::after {transform: translateX(20px);}
    .number {height: 60px; padding: 0 6px;}
    .number label {display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}
    .track {display: grid; grid-template-columns: 28px 1fr 28px; align-items: center; gap: 4px; height: 25px; margin-top: 4px; font-size: 12px;}
    .track span:last-child {text-align: right;}
    input[type="range"] {appearance: none; width: 100%; height: 2px; background: currentColor; cursor: pointer;}
    input[type="range"]::-webkit-slider-thumb {appearance: none; width: 14px; height: 14px; border-radius: 50%; background: white; border: 2px solid var(--accent-color); box-shadow: 0 0 10px var(--accent-color);}
    .numeric-value {display: block; width: 90px; margin: 0 auto; text-align: center; background: none; border: 0; font-size: 11px; appearance: textfield;}
    .numeric-value::-webkit-inner-spin-button {appearance: none;}
    .mode {padding: 0 6px 10px; min-height: 58px;}
    .selected {display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 24px; margin-top: 6px; padding: 2px 5px; color: white; text-align: left; background: #1e1e1e8c; box-shadow: 0 0 14px #0006; font-size: 15px;}
    .selected span {transition: transform 180ms;}
    .selected span.open {transform: rotate(180deg);}
    .options {background: #1e1e1e8c; padding: 3px;}
    .options button {display: block; background: none; color: #ebebeb; width: 100%; padding: 4px; text-align: left; font-size: 13px; overflow-wrap: anywhere;}
    .options button:hover, .options button.active {color: var(--accent-color); background: #ffffff14;}
    .group-title {display: flex; width: 100%; justify-content: space-between; background: none; text-align: left; padding: 5px 0;}
    .group {padding: 0 6px;}
    .text {display: block; padding: 4px 6px 8px;}
    .text input {width: 100%; background: #3232324b; border: 0; padding: 4px; font-size: 13px; margin-top: 3px;}
    .native-setting {padding: 0 6px; overflow-wrap: anywhere;}
</style>
