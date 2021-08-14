<template>
    <div class="error-block">
        <v-icon x-large>
            mdi-magnify-remove-outline
        </v-icon>
        <div class="error-message">الصفحة غير موجودة</div>
        <v-btn plain color="red">انقر للعودة</v-btn>
    </div>
</template>

<style scoped>
.error-block{
    display: block;
    text-align: center;
    margin-top: 150px;
}
.error-block .v-icon {
    color: var(--v-primary-base) !important;
    font-size: 200px !important;
}
.error-block .error-message{
    font-family: bukraRegular;
    font-size: 16px;
    margin-bottom: 30px;
}
</style>
