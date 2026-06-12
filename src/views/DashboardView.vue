<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import DailyAllowanceHero from '@/components/molecules/DailyAllowanceHero.vue'
import CategoryBreakdown from '@/components/organisms/CategoryBreakdown.vue'
import TransactionList from '@/components/organisms/TransactionList.vue'

const store = useDashboardStore()
const auth = useAuthStore()

// load() runs on every dashboard mount: open the app, see today's truth.
onMounted(() => store.load())
</script>

<template>
  <main class="dashboard">
    <header class="topbar">
      <span class="brand">Restje</span>
      <button class="logout" @click="auth.logout">Log out</button>
    </header>

    <template v-if="store.data">
      <DailyAllowanceHero
        :today-remaining="store.data.todayRemaining"
        :daily-allowance="store.data.dailyAllowance"
        :today-spent="store.data.todaySpent"
      />
      <p class="month">
        {{ Number(store.data.monthRemaining).toFixed(2) }} left this month over
        {{ store.data.daysLeft }} days
      </p>
      <CategoryBreakdown :categories="store.data.byCategory || []" />
      <h2 class="section-title">Recent</h2>
      <TransactionList
        :transactions="store.data.recentTransactions || []"
        @changed="store.load()"
      />
    </template>

    <p v-else-if="store.loading" class="state">Loading…</p>

    <section v-else-if="store.error === 'NEEDS_IMPORT'" class="state setup">
      <p>Let’s set up your budget.</p>
      <p class="muted">Import a bank export to get your first daily number.</p>
      <RouterLink to="/import" class="cta">Import a CSV</RouterLink>
    </section>

    <section v-else-if="store.error" class="state">
      <p>Couldn’t load your dashboard.</p>
      <button @click="store.load()">Retry</button>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
}
.brand {
  font-weight: 700;
  color: var(--c-accent);
}
.logout {
  background: none;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
}
.month {
  text-align: center;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-6);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  padding: 0 var(--space-4);
  margin: 0 0 var(--space-2);
}
.state {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}
.state .muted {
  color: var(--c-text-muted);
  font-size: 0.9rem;
}
.state button {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  cursor: pointer;
}
.state .cta {
  display: inline-block;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
}
</style>
