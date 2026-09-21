<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import MkChrome from '@/components/marketing/MkChrome.vue'
import { legalDocs, legalNav, type LegalSlug } from '@/data/legal'
import '@/styles/marketing.css'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))

const doc = computed(() => {
  const key = slug.value as LegalSlug
  return legalDocs[key] ?? null
})

watch(
  doc,
  (value) => {
    document.title = value ? `${value.title} · REXmlm` : 'Legal · REXmlm'
  },
  { immediate: true },
)
</script>

<template>
  <MkChrome>
    <article v-if="doc" class="mk-wrap mk-legal">
      <p class="mk-kicker">Legal</p>
      <h1 class="mk-h2" style="margin-top: 0.4rem">{{ doc.title }}</h1>
      <p class="mk-legal-meta">Última actualización: {{ doc.updated }}</p>
      <p class="mk-lead">{{ doc.intro }}</p>

      <nav class="mk-legal-toc" aria-label="Documentos">
        <RouterLink
          v-for="item in legalNav"
          :key="item.slug"
          :to="`/legal/${item.slug}`"
          :class="{ 'is-active': item.slug === doc.slug }"
        >
          {{ item.title }}
        </RouterLink>
      </nav>

      <section v-for="section in doc.sections" :key="section.title" class="mk-legal-block">
        <h2>{{ section.title }}</h2>
        <p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p>
        <ul v-if="section.bullets?.length">
          <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </section>
    </article>

    <article v-else class="mk-wrap mk-legal">
      <h1 class="mk-h2">Políticas de REXmlm</h1>
      <p class="mk-lead">Elige un documento. Forman parte del contrato al crear cuenta o pagar un plan.</p>
      <ul class="mk-checks">
        <li v-for="item in legalNav" :key="item.slug">
          <RouterLink :to="`/legal/${item.slug}`">{{ item.title }}</RouterLink>
        </li>
      </ul>
    </article>
  </MkChrome>
</template>
