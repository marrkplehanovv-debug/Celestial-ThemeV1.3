<script lang="ts">
    export let title: string;
    export let message: string;
    export let severity: string;
</script>

<div class="notification">
    <div class="icon {severity.toString().toLowerCase()}"></div>
    <div class="title">{title}</div>
    <div class="message">{message}</div>
</div>

<style lang="scss">
  .notification {
    display: grid;
    grid-template-areas:
            "a b"
            "a c";
    grid-template-columns: max-content 1fr;
    column-gap: 10px;
    background: var(--celestial-hud-surface) padding-box, var(--celestial-hud-edge) border-box;
    border: 1px solid transparent;
    box-shadow: var(--celestial-hud-shadow);
    border-radius: 5px;
    width: 300px;
    overflow: hidden;
    padding: 10px;
    margin-bottom: 8px;
    align-items: center;
  }

  .icon {
    height: 40px;
    width: 40px;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 4px;
    grid-area: a;
    transition: background-color 0.2s;
    box-shadow: inset 0 1px 0 #ffffff30;
    position: relative;
    background-image: url("/img/hud/notification/icon-toggle.svg");

    &.success {
      background-color: var(--notification-success-color);
      background-image: url("/img/hud/notification/icon-success.svg");
    }

    &.error {
      background-color: var(--notification-error-color);
      background-image: url("/img/hud/notification/icon-error.svg");
    }

    &.info {
      background-color: var(--notification-info-color);
      background-image: url("/img/hud/notification/icon-info.svg");
    }

    &.disabled,
    &.enabled {
      &::after {
        content: "";
        position: absolute;
        height: 10px;
        width: 10px;
        border-radius: 5px;
        top: 50%;
        transform: translate(-50%, -50%);
        background: var(--notification-toggle-knob-color);
        transition: all 0.2s ease-out;
      }
    }

    &.enabled {
      background-color: var(--notification-success-color);

      &::after {
        left: 62%;
      }
    }

    &.disabled {
      background-color: var(--notification-error-color);

      &::after {
        left: 38%;
      }
    }
  }

  .title {
    grid-area: b;
    font-size: 15px;
    color: var(--notification-title-color);
    font-weight: 500;
    text-shadow: 0 1px 2px #0008;
  }

  .message {
    grid-area: c;
    font-size: 13px;
    line-height: 18px;
    color: var(--notification-message-color);
  }
</style>
