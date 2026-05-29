<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="docs-placeholder fade-in">
    <div class="docs-content">
      <Icon name="book" :size="48" style="color: var(--brand); margin-bottom: 24px;" />
      <h1 class="mono" style="font-size: 24px; margin-bottom: 12px; font-weight: 600">Cellora Documentation</h1>
      <p style="color: var(--text-muted); line-height: 1.6; max-width: 480px; margin: 0 auto 32px;">
        This page will host the comprehensive API reference, quickstarts, and guides for interacting with Cellora's GraphQL and REST endpoints.
      </p>
      
      <div style="display: flex; gap: 12px; justify-content: center">
        <Button variant="primary" @click="navigateTo('/app/explorer')">
          <template #leftIcon><Icon name="terminal" :size="14" /></template>
          Try the API Explorer
        </Button>
        <Button variant="outline" @click="navigateTo('/app/overview')">
          <template #leftIcon><Icon name="chevronLeft" :size="14" /></template>
          Back to Dashboard
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-placeholder {
  display: flex; align-items: center; justify-content: center;
  min-height: calc(100vh - 120px);
  text-align: center;
}
.docs-content {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-3);
  padding: 64px 48px;
  box-shadow: var(--shadow-sm);
}
</style>
