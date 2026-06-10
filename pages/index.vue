<script setup lang="ts">
const goSignIn = () => navigateTo('/sign-in')

useHead({
  title: 'Cellora — Indexed CKB data, one API call away',
})
</script>

<template>
  <div class="landing">
    <NavBar @sign-in="goSignIn" />
    <Hero @sign-in="goSignIn" />
    <ValueProps />
    <Features />
    <LiveExplorer />
    <!-- <Pricing /> -->
    <FinalCTA @sign-in="goSignIn" />
    <SiteFooter />
  </div>
</template>

<style scoped>
.landing { background: var(--bg); min-height: 100vh; }
</style>
