<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { displayUser: user } = useAuth()
</script>

<template>
  <div class="st">
    <div class="st__header">
      <h2>Account Settings</h2>
      <p class="st__subtitle">Manage your profile and subscription tier.</p>
    </div>

    <Card>
      <CardHeader title="Profile" subtitle="Your GitHub identity" />
      <div class="st__profile">
        <img :src="user.avatar || ''" alt="Avatar" class="st__avatar" />
        <div class="st__info">
          <div class="st__label">Handle</div>
          <div class="st__value mono">@{{ user.handle }}</div>
          
          <div class="st__label" style="margin-top: 12px">Email</div>
          <div class="st__value mono">{{ user.email }}</div>
        </div>
      </div>
    </Card>

    <Card>
      <CardHeader title="Subscription" subtitle="Current plan and billing" />
      <div class="st__plan-row">
        <div class="st__info">
          <div class="st__label">Current Tier</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
            <Badge variant="brand" size="sm" mono>{{ user.plan }}</Badge>
            <span v-if="user.org" class="mono st__org">{{ user.org }}</span>
          </div>
        </div>
        <Button variant="outline" disabled>Upgrade Plan</Button>
      </div>
      <p class="st__plan-desc">
        Billing management and team organization features are currently under development.
      </p>
    </Card>
  </div>
</template>

<style scoped>
.st { display: flex; flex-direction: column; gap: 24px; max-width: 640px; margin: 0 auto; width: 100%; }
.st__header h2 { font-size: 24px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.02em; }
.st__subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }

.st__profile {
  display: flex; gap: 24px; padding: 16px;
}
.st__avatar {
  width: 80px; height: 80px; border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}
.st__info { display: flex; flex-direction: column; justify-content: center; }
.st__label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 4px; }
.st__value { font-size: 14px; color: var(--text); }
.st__org { font-size: 12px; color: var(--text-muted); }

.st__plan-row { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.st__plan-desc { padding: 0 16px 16px; margin: 0; font-size: 13px; color: var(--text-muted); }
</style>
