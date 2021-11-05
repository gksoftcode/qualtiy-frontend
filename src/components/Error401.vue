<template>
  <div class="error-block">
    <v-icon color="primary" class="mdi-256px">
      mdi-account-off-outline
    </v-icon>
    <div class="error-message">غير مصرح لك</div>
    <v-btn text color="red" :to="{ name: 'AdminLanding' }">
      انقر للعودة
      <v-icon>
        mdi-home-account
      </v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.error-block {
  display: block;
  text-align: center;
  margin-top: 75px;
}

.error-block .error-message {
  color: var(--v-primary-base) !important;
  font-family: bukraRegular;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 30px;
}
</style>
