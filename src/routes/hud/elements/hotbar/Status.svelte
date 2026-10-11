<script lang="ts">
    export let max: number;
    export let value: number;
    export let color: string;
    export let alignRight: boolean;
    export let label: string | null = null;
    export let icon: string | null = null;
    $: percentage = max > 0 && Number.isFinite(value) ? Math.min(100, Math.max(0, value / max * 100)) : 0;
    $: shownLabel = label ?? `${Number(value.toFixed(1))} / ${Number(max.toFixed(1))}`;
</script>

<div class="progress" class:align-right={alignRight} role="progressbar" aria-label={icon ?? "Status"} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, Math.min(max, value))}>
    <div class="label">{shownLabel}</div>
    {#if icon}<img class="icon" src="img/hud/hotbar/icon-{icon}.svg" alt=""/>{/if}
    <div class="progress-bar" class:align-right={alignRight} style="width: {percentage}%; --status-color: {color};"></div>
</div>

<style lang="scss">
    .progress {position: relative; height: 26px; border: 1px solid transparent; border-radius: 4px; background: var(--celestial-inventory-surface) padding-box, var(--celestial-hud-edge) border-box; box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 9%, transparent); overflow: hidden;}
    .label {position: absolute; top: 50%; right: 8px; transform: translateY(-50%); color: #fff; font-size: 11px; font-weight: 500; text-shadow: 0 1px 2px #0009;}
    .icon {position: absolute; width: 14px; height: 14px; left: 8px; top: 50%; transform: translateY(-50%);}
    .progress-bar {position: absolute; left: 0; bottom: 0; height: 3px; background: var(--celestial-hud-gradient); box-shadow: 0 -1px 5px color-mix(in srgb, var(--accent-color) 25%, transparent); transition: width .2s ease-out;}
    .align-right .label {left: 8px; right: auto;}
    .align-right .icon {right: 8px; left: auto;}
    .progress-bar.align-right {right: 0; left: auto;}
</style>
