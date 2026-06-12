<script setup>
import { onMounted } from 'vue'
import { useKnownAccountsStore } from '@/stores/knownAccounts'
import { useDashboardStore } from '@/stores/dashboard'
import KnownAccountRow from '@/components/molecules/KnownAccountRow.vue'

const accounts = useKnownAccountsStore()
const dashboard = useDashboardStore()

onMounted(() => accounts.load())

// A treatment change must visibly move the daily number — that cause-and-effect
// is what makes the setting feel real. Reflect the new list and reload the
// dashboard.
async function onChanged() {
  await accounts.load()
  await dashboard.load()
}
</script>

<template>
  <div class="manager">
    <section>
      <h2>My accounts</h2>
      <p class="hint">
        IBANs that are yours. Money moving between them isn’t spending.
      </p>
      <KnownAccountRow
        v-for="a in accounts.own"
        :key="a.id"
        :account="a"
        @changed="onChanged"
      />
      <p v-if="!accounts.own.length" class="empty">None yet.</p>
    </section>

    <section>
      <h2>People &amp; parties</h2>
      <p class="hint">People and companies you pay or get paid by.</p>
      <KnownAccountRow
        v-for="a in accounts.parties"
        :key="a.id"
        :account="a"
        @changed="onChanged"
      />
      <p v-if="!accounts.parties.length" class="empty">None yet.</p>
    </section>

    <section v-if="accounts.unclassified.length">
      <h2>Unclassified parties</h2>
      <p class="hint">
        New counterparties from your last import. Triage them — they default to
        transfer until you decide.
      </p>
      <KnownAccountRow
        v-for="a in accounts.unclassified"
        :key="a.id"
        :account="a"
        @changed="onChanged"
      />
    </section>

    <dl class="legend">
      <dt>transfer</dt>
      <dd>moving my own money around, don’t count it</dd>
      <dt>saving</dt>
      <dd>setting money aside, don’t count it as spent</dd>
      <dt>income</dt>
      <dd>money coming in</dd>
      <dt>expense</dt>
      <dd>a real cost I pay a person (e.g. rent), count it</dd>
    </dl>
  </div>
</template>

<style scoped>
.manager section {
  margin-bottom: var(--space-6);
}
h2 {
  font-size: 1rem;
  margin: 0 0 var(--space-1);
}
.hint {
  font-size: 0.85rem;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-2);
}
.empty {
  color: var(--c-text-muted);
  font-size: 0.9rem;
}
.legend {
  margin: var(--space-6) 0 0;
  padding: var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
  font-size: 0.85rem;
}
.legend dt {
  font-weight: 600;
  text-transform: capitalize;
}
.legend dd {
  margin: 0 0 var(--space-2);
  color: var(--c-text-muted);
}
</style>
