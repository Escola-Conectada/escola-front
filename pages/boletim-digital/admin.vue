<template>
  <section class="rounded-lg border border-[#d4dee9] bg-white/95 p-5 text-sm font-semibold text-[#62728a]">
    Redirecionando...
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  roles: []
})

const route = useRoute()

await navigateTo({ path: '/boletim-digital', query: route.query }, { replace: true })
</script>
