<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  components: {},

  data: () => ({
    //
  })
}
</script>
<style lang="scss">
.mdi-256px {
  font-size: 256px !important;
}
.v-application {
  /*font-family: bukralight, sans-serif !important;*/
}
.wc-fieldset {
  border-radius: 5px;
  border-right-width: 1px;
  padding-left: 12px;
  border-top-width: 1px;
  border-left-width: 1px;
  border-bottom-width: 1px;
  padding-right: 12px;
}
.confirm-var {
  color: var(--v-primary-base);
}

.v-dialog--active .v-card__title {
  background-color: var(--v-primary-base);
  color: white;
  margin-bottom: 16px;
}

.dialog-primary-text {
  color: var(--v-primary-base);
}

.row-item {
  border: var(--v-primary-base) 1px solid;
  border-radius: 3px;
  margin-bottom: 2px;
}

.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    font-family: bukraRegular !important;
    font-size: 12px;
    background: #333333cc;
    color: white;
    border-radius: 4px;
    padding: 3px 10px 5px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: #333333cc;
    z-index: 1;
  }

  &[x-placement^='top'] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='bottom'] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='right'] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^='left'] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    $color: #f9f9f9;

    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }

    .popover-arrow {
      border-color: $color;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
}
</style>
