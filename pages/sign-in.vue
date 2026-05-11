<script setup lang="ts">
const authing = ref(false)
const { signedIn } = useAuth()

const handleAuth = () => {
  authing.value = true
  setTimeout(() => {
    signedIn.value = true
    navigateTo('/app/overview')
  }, 900)
}

useHead({ title: 'Sign in · Cellora' })
</script>

<template>
  <div class="signin">
    <div class="lattice lattice-fade signin__bg" />
    <div class="signin__card-wrap">
      <Card>
        <div class="signin__inner">
          <Wordmark :size="20" />
          <div class="signin__title">Sign in to Cellora</div>
          <div class="signin__lede">
            We use GitHub OAuth, server-mediated. Your dashboard sees session cookies — never bearer tokens.
          </div>
          <Button variant="primary" size="lg" :loading="authing" :style="{ width: '100%', marginTop: '22px' }" @click="handleAuth">
            <template v-if="!authing" #leftIcon><Icon name="github" :size="16" /></template>
            {{ authing ? 'Authenticating…' : 'Continue with GitHub' }}
          </Button>
          <div class="signin__note">
            <Icon name="lock" :size="13" style="margin-top: 2px; color: var(--text-dim)" />
            We only read your handle, avatar, and primary email. We never push to your repos.
          </div>
          <div class="hairline signin__foot">
            New to Cellora? <a href="#" style="color: var(--brand)">Read the docs</a> · <a href="#" style="color: var(--brand)">License</a>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.signin {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.signin__bg { position: absolute; inset: 0; opacity: 0.6; }
.signin__card-wrap { width: 380px; max-width: 100%; position: relative; }
.signin__inner { padding: 8px; }
.signin__title { margin-top: 18px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
.signin__lede { margin-top: 6px; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
.signin__note {
  margin-top: 18px;
  padding: 12px;
  background: var(--bg-elev);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex; gap: 8px;
}
.signin__foot {
  margin-top: 22px;
  padding-top: 14px;
  font-size: 12px;
  color: var(--text-dim);
  text-align: center;
}
</style>
