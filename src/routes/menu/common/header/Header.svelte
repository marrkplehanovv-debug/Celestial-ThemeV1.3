<script lang="ts">
    import Account from "./account/Account.svelte";
    import Notifications from "./Notifications.svelte";
    import {listen} from "../../../../integration/ws";
    import {location} from "svelte-spa-router";
    import type {
        AccountManagerAdditionEvent,
        AccountManagerLoginEvent,
        AccountManagerMessageEvent
    } from "../../../../integration/events";
    import {notification} from "./notification_store";


    listen("accountManagerAddition", (e: AccountManagerAdditionEvent) => {
        if (!e.error) {
            notification.set({
                title: "AltManager",
                message: `Successfully added account ${e.username}`,
                error: false
            });
        } else {
            notification.set({
                title: "AltManager",
                message: e.error,
                error: true
            });
        }
    });

    listen("accountManagerMessage", (e: AccountManagerMessageEvent) => {
        notification.set({
            title: "AltManager",
            message: e.message,
            error: false
        });
    });

    listen("accountManagerLogin", (e: AccountManagerLoginEvent) => {
        if (!e.error) {
            notification.set({
                title: "AltManager",
                message: `Successfully logged in to account ${e.username}`,
                error: false
            });
        } else {
            notification.set({
                title: "AltManager",
                message: e.error,
                error: true
            });
        }
    });
</script>

<div class="header" class:home={$location === "/title"}>
    <div class="brand"><img src="img/hud/atomwhite.png" alt=""/>Celestial</div>
    <Notifications/>
    <div class="tools">
        <Account/>
    </div>
</div>

<style lang="scss">

    .header {position: relative; z-index: 20; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; align-items: center; min-height: 60px;}
    .brand {display: flex; align-items: center; gap: 10px; color: #e0e0e0; font-size: 21px; text-shadow: 1px 1px 2px #0009;}
    .brand img {width: 34px; height: 34px;}
    .home .brand {visibility: hidden;}
    .tools {margin-left: auto; display: flex; align-items: center; gap: 12px;}
    @media (max-width: 760px) {.brand {display: none;} .tools {gap: 8px;}}

</style>
