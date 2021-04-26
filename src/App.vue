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
</style>
