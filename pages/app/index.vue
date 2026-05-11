<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo('/app/overview', { redirectCode: 302 })
</script>

<template><div /></template>
