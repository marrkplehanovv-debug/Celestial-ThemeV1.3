<script lang="ts">
    import ToolTip from "../../ToolTip.svelte";
    import {
        directLoginToCrackedAccount,
        getAccounts,
        getSession,
        loginToAccount,
        openScreen,
        randomUsername
    } from "../../../../../integration/rest";
    import {onMount} from "svelte";
    import {listen} from "../../../../../integration/ws";
    import {location} from "svelte-spa-router";
    import {quintOut} from "svelte/easing";
    import {fade, slide, fly} from "svelte/transition";
    import type {Account} from "../../../../../integration/types";
    import Avatar from "./Avatar.svelte";
    import {notification} from "../notification_store";
    import RippleLoader from "../../RippleLoader.svelte";
    import {isLoggingIn} from "../../../altmanager/altmanager_store";
    import {isAnniversary} from "../../../../../util/utils";

    let username = "";
    let service = "";
    let avatar = "";
    let online = true;

    let expanded = false;
    let accountElement: HTMLElement;
    let headerElement: HTMLElement;

    let searchQuery = "";
    let accounts: Account[] = [];

    $: renderedAccounts = accounts.filter(a => a.username.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "");

    $: inAccountManager = $location === "/altmanager";
    $: inTitle = $location === "/title";

    async function refreshSession() {
        const session = await getSession();
        username = session.username;
        service = session.service;
        avatar = session.avatar;
        online = session.online;
    }

    async function refreshAccounts() {
        accounts = await getAccounts();
    }

    onMount(async () => {
        await refreshSession();
        await refreshAccounts();
    });

    listen("session", async () => {
        await refreshSession();
    });

    listen("accountManagerRemoval", async () => {
        await refreshAccounts();
    });

    listen("accountManagerAddition", async () => {
        await refreshAccounts();
    });

    function handleWindowClick(e: MouseEvent) {
        if (!accountElement.contains(e.target as Node)) {
            expanded = false;
            searchQuery = "";
        }
    }

    function handleSelectClick(e: MouseEvent) {
        if (!expanded) {
            // Prevent icon buttons from opening quick switcher
            expanded = !(e.target as HTMLElement).classList.contains("icon");
        } else {
            expanded = !headerElement.contains(e.target as Node);
        }

        if (!expanded) {
            searchQuery = "";
        }
    }

    async function login(account: Account) {
        notification.set({
            title: "AltManager",
            message: "Logging in...",
            error: false
        });

        await loginToAccount(account.id);
    }

    async function loginWithRandomUsername() {
        const username = await randomUsername();
        await directLoginToCrackedAccount(username, false);
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="account" class:expanded bind:this={accountElement} on:click={handleSelectClick}>
    <div class="header" bind:this={headerElement}>
        {#if $isLoggingIn}
            <div class="avatar-wrapper" transition:fade={{ duration: 200 }}>
                <RippleLoader size={40} />
            </div>
        {:else}
            <div class="avatar-wrapper">
                <object data={avatar} type="image/png" class="avatar" aria-label="avatar" in:fade={{ duration: 200, delay: 200 }}>
                    <img src="img/steve.png" alt=avatar class="avatar">
                </object>

                {#if isAnniversary() && inTitle}
                    <img transition:fly={{duration: 500, y: -10}} class="party-hat" src="img/anniversary/party-hat.svg" alt="party-hat">
                {/if}
            </div>
        {/if}
        <div class="username">{username}</div>
        <div class="account-type">
            {#if online}
                <span class="online">{service}</span>
            {:else}
                <span class="offline">{service}</span>
            {/if}
        </div>
        <div class="buttons">
            <button class="icon-button" type="button" on:click={loginWithRandomUsername}>
                <ToolTip text="Random username"/>

                <img class="icon" src="img/menu/account/icon-random.svg" alt="random username">
            </button>
            <button class="icon-button" disabled={inAccountManager} type="button"
                    on:click={() => openScreen("altmanager")}>
                <ToolTip text="Change account"/>

                <img class="icon" src="img/menu/icon-pen.svg" alt="change account">
            </button>
        </div>
    </div>

    {#if expanded}
        <div class="quick-switcher" transition:fade|global={{ duration: 200, easing: quintOut }}>
            <!-- svelte-ignore a11y_autofocus -->
            <input type="text" autofocus class="account-search" placeholder="Search..." bind:value={searchQuery}>

            {#if accounts.length > 0}
                {#if renderedAccounts.length > 0}
                    <div class="account-list">
                        {#each renderedAccounts as a}
                            <div on:click={() => login(a)} class="account-item"
                                 transition:slide|global={{ duration: 200, easing: quintOut }}
                                 class:active={a.username === username}>
                                <Avatar url={a.avatar}/>
                                <div class="username">{a.username}</div>
                                <div class="type">{a.type}</div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="placeholder">No results</div>
                {/if}
            {:else}
                <div class="placeholder">Account list is empty</div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">

  .account {
    width: min(300px, calc(100vw - 160px));
    position: relative;

    &.expanded {
      .header {
        border-radius: 5px 5px 0 0;
      }
    }
  }

  .header {
    background: #0f0f0f9c;
    border: 1px solid #ffffff18;
    box-shadow: 0 0 15px #0009;
    backdrop-filter: blur(8px);
    padding: 9px 12px;
    border-radius: 5px;
    align-items: center;
    display: grid;
    grid-template-areas:
        "a b c"
        "a d c";
    grid-template-columns: max-content 1fr max-content;
    column-gap: 15px;
    cursor: pointer;
    transition: ease border-radius .2s;

    .avatar-wrapper {
      grid-area: a;
      position: relative;

      .avatar {
        height: 40px;
        width: 40px;
        border-radius: 4px;
      }

      .party-hat {
        position: absolute;
        height: 130px;
        top: -70px;
        left: -38px;
        transform: rotate(-30deg);
      }
    }

    .username {
      font-weight: 600;
      color: var(--menu-text-color);
      font-size: 14px;
      grid-area: b;
      align-self: flex-end;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .account-type {
      font-weight: 500;
      font-size: 14px;
      grid-area: d;
      align-self: flex-start;

      .online {
        color: var(--menu-account-premium-color);
      }

      .offline {
        color: var(--menu-text-dimmed-color);
      }
    }

    .buttons {
      grid-area: c;
      display: flex;
      column-gap: 10px;
      align-items: center;
    }

    .icon-button {
      background-color: transparent;
      border: none;
      position: relative;
      height: max-content;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: ease opacity .2s;

      &:disabled {
        pointer-events: none;
        opacity: .5;
      }
    }
  }

  .quick-switcher {
    position: absolute;
    z-index: 1000;
    width: 100%;
    border-radius: 0 0 5px 5px;
    background: color-mix(in srgb, var(--celestial-secondary) 10%, #0a0a0af5);
    border: 1px solid #ffffff18;
    box-shadow: 0 6px 18px #0009;

    .placeholder {
      font-weight: 500;
      font-size: 14px;
      color: var(--menu-text-dimmed-color);
      padding: 15px 20px;
    }

    .account-search {
      background-color: var(--menu-account-search-background-color);
      border: none;
      color: var(--menu-text-color);
      font-family: inherit;
      padding: 15px 15px 15px 50px;
      width: 100%;
      font-size: 14px;
      border-bottom: solid 4px var(--menu-account-search-border-color);
      background-image: url("/img/menu/icon-search.svg");
      background-repeat: no-repeat;
      background-position: 18px center;
      background-size: 18px 18px;
    }

    .account-list {
      max-height: 350px;
      overflow: auto;
    }

    .account-item {
      color: var(--menu-text-dimmed-color);
      font-size: 14px;
      padding: 15px 20px;
      transition: ease color .2s;
      cursor: pointer;
      display: grid;
      grid-template-areas:
        "a b"
        "a c";
      grid-template-columns: max-content 1fr;
      column-gap: 15px;

      .username {
        grid-area: b;
        font-weight: 600;
        font-size: 14px;
        transition: ease color .2s;
      }

      .type {
        grid-area: c;
      }

      &:hover {
        color: var(--menu-text-color);
      }

      &.active {
        .username {
          color: var(--accent-color);
        }
      }
    }
  }
</style>
