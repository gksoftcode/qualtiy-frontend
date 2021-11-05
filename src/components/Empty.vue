<template>
  <div class="error-block">
    <v-icon x-large>
      mdi-alert-rhombus
    </v-icon>
    <div class="error-message">{{ message }}</div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.error-block {
  display: block;
  text-align: center;
  margin-top: 75px;
}
.error-block .v-icon {
  color: var(--v-primary-base) !important;
  font-size: 200px !important;
}
.error-block .error-message {
  font-family: bukraRegular;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 30px;
}
</style>
