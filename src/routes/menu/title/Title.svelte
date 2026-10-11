<script lang="ts">
    import MainButton from "./buttons/MainButton.svelte";
    import ButtonContainer from "../common/buttons/ButtonContainer.svelte";
    import IconTextButton from "../common/buttons/IconTextButton.svelte";
    import IconButton from "../common/buttons/IconButton.svelte";
    import {browse, exitClient, getClientUpdate, getSession, openScreen, toggleBasicMode} from "../../../integration/rest";
    import {onMount} from "svelte";
    import {listen} from "../../../integration/ws";
    import {notification} from "../common/header/notification_store";

    let username = "Player";
    let clientButtonsShown = false;

    async function refreshSession() {
        try {username = (await getSession()).username;} catch {}
    }
    onMount(() => {
        refreshSession();
        const timeout = window.setTimeout(async () => {
            try {
                const update = (await getClientUpdate()).update;
                if (update) notification.set({title: `LiquidBounce ${update.clientVersion} has been released!`, message: "Download it from liquidbounce.net!", error: false, delay: 99999999});
            } catch {}
        }, 2000);
        return () => window.clearTimeout(timeout);
    });
    listen("session", refreshSession);
</script>

<div class="title-screen">
    <details class="changelog">
        <summary>Changelog</summary>
        <div class="changes">
            <h2>Celestial Theme 1.3</h2>
            <p><span>+</span> Nine palettes and synchronized gradient animation</p>
            <p><span>+</span> Celestial-styled client settings</p>
            <p><span>~</span> Live HUD settings and white editor text</p>
            <p><span>~</span> Celestial wallpaper and Inventory-style HUD cards</p>
        </div>
    </details>
    <div class="menu-center">
        <img class="atom" src="img/hud/atomwhite.png" alt="Celestial"/>
        <div class="main-buttons">
            {#if clientButtonsShown}
                <MainButton title="Click GUI" on:click={() => openScreen("clickgui")} index={0}/>
                <MainButton title="Alt Manager" on:click={() => openScreen("altmanager")} index={1}/>
                <MainButton title="Proxy Manager" on:click={() => openScreen("proxymanager")} index={2}/>
                <MainButton title="Back" on:click={() => clientButtonsShown = false} index={3}/>
            {:else}
                <MainButton title="Singleplayer" on:click={() => openScreen("singleplayer")} index={1}/>
                <MainButton title="Multiplayer" on:click={() => openScreen("multiplayer")} index={2}/>
                <MainButton title="Alt Manager" on:click={() => openScreen("altmanager")} index={3}/>
            {/if}
            <div class="button-pair">
                <MainButton title="Options" on:click={() => openScreen("options")} index={4}/>
                <MainButton title="Quit Game" on:click={exitClient} index={5}/>
            </div>
        </div>
    </div>
    <div class="utilities">
        <ButtonContainer>
            <IconTextButton icon="icon-liquidbounce.svg" title="LiquidBounce" on:click={() => clientButtonsShown = !clientButtonsShown}/>
            <IconTextButton icon="icon-realms.svg" title="Realms" on:click={() => openScreen("multiplayer_realms")}/>
            <IconTextButton icon="icon-eye.svg" title="Basic Mode" on:click={toggleBasicMode}/>
        </ButtonContainer>
        <ButtonContainer>
            <IconButton title="GitHub" icon="github" on:click={() => browse("MAINTAINER_GITHUB")}/>
            <IconButton title="Discord" icon="discord" on:click={() => browse("MAINTAINER_DISCORD")}/>
            <IconTextButton title="liquidbounce.net" icon="icon-liquidbounce.net.svg" on:click={() => browse("CLIENT_WEBSITE")}/>
        </ButtonContainer>
    </div>
    <footer><span>Welcome, {username}!</span><span>Version: Celestial Theme 1.3</span></footer>
</div>

<style lang="scss">
    .title-screen {position: relative; flex: 1; min-height: 0;}
    .menu-center {position: fixed; top: calc(25vh - 16px); left: 50%; transform: translateX(-50%); width: min(400px, calc(100vw - 48px));}
    .atom {display: block; width: 64px; height: 64px; object-fit: contain; margin: 0 auto 48px; filter: drop-shadow(0 2px 3px #0009);}
    .main-buttons {display: flex; flex-direction: column; gap: 8px;}
    .button-pair {display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px;}
    .utilities {position: absolute; bottom: 34px; left: 0; right: 0; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;}
    footer {position: fixed; bottom: 8px; left: 8px; right: 8px; display: flex; justify-content: space-between; gap: 16px; font-size: 13px; color: #fff; text-shadow: 1px 1px 2px #000;}
    .changelog {position: fixed; top: 24px; left: 24px; z-index: 10; color: #e0e0e0; font-size: 13px;}
    summary {cursor: pointer; padding: 12px 16px; background: #0f0f0f7d; border-radius: 4px; box-shadow: 0 0 15px #0009;}
    .changes {margin-top: 6px; padding: 16px; background: #0a0a0ade; border: 1px solid #ffffff18; border-radius: 4px; box-shadow: 0 0 16px #000b; backdrop-filter: blur(12px);}
    h2 {margin: 0 0 14px; font-size: 15px; font-weight: 500;}
    p {margin: 8px 0;}
    p span {color: var(--accent-color); margin-right: 8px;}
    @media (max-height: 700px) {.menu-center {top: 23vh;} .atom {width: 48px; height: 48px; margin-bottom: 18px;} .button-pair {margin-top: 8px;} .utilities {bottom: 26px;}}
    @media (max-height: 600px) {.menu-center {top: 92px;} .atom, .changelog {display: none;}}
    @media (max-width: 760px) {.utilities {justify-content: center;} .utilities > :global(.button-container:last-child) {display: none;} footer {font-size: 11px;} .changelog {left: 12px; top: 16px;}}
</style>
