<script lang="ts">
    export let settings: {[name: string]: unknown} = {};
    $: uid = String(settings.uid ?? "1");
</script>

<div class="watermark">
    <div class="card"><div class="title">Celestial</div><div class="uid">UID: <span>{uid}</span></div></div>
    <div class="atom" aria-hidden="true"></div>
</div>

<style lang="scss">

    .watermark {
        position: relative;
        display: flex;
        align-items: center;
        width: max-content;
        min-width: 198px;
        height: 64px;
        padding-right: 6px;
        color: #ebebeb;
        text-shadow: 1px 1px 2px #0009;
    }
    .card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 184px;
        height: 49px;
        margin-left: 8px;
        padding: 4px 14px 4px 47px;
        border-radius: 24px 7px 7px 24px;
        background: linear-gradient(105deg, var(--accent-color), var(--celestial-secondary));
        box-shadow: 0 0 18px color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
    .title {font-size: 21px; line-height: 24px; letter-spacing: -.6px;}
    .uid {font-size: 14px; line-height: 17px; white-space: nowrap;}
    .uid span {color: #eee;}
    .atom {
        position: absolute;
        top: 3px;
        left: 0;
        width: 57px;
        height: 57px;
        border-radius: 50%;
        background: linear-gradient(125deg, var(--accent-color), var(--celestial-secondary));
        box-shadow: 0 0 20px color-mix(in srgb, var(--accent-color) 45%, transparent), inset 0 1px 0 #ffffff60;
    }
    .atom::after {
        content: "";
        position: absolute;
        inset: 3px;
        background: #ffffff;
        mask: url("/img/hud/atomwhite.png") center / contain no-repeat;
        filter: drop-shadow(0 1px 1px #000b);
    }
</style>
