<template>
  <AppApiLoading />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const appConfig = useAppConfigStore()

useHead(() => ({
  title: appConfig.nomeEscola
}))

onMounted(() => {
  void appConfig.carregar()
})
</script>
