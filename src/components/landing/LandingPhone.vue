<script setup lang="ts">
import type { LandingPhotoFrame } from '@/types/auth'

withDefaults(
  defineProps<{
    image: string
    href?: string
    label?: string
    hint?: string
    editable?: boolean
    active?: boolean
    frame?: LandingPhotoFrame
  }>(),
  {
    href: '',
    label: 'WhatsApp',
    hint: 'Cambiar foto',
    editable: false,
    active: false,
    frame: 'phone',
  },
)

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <figure
    class="lp-portrait"
    :class="[`is-${frame}`, { 'is-editable': editable, 'is-active': active }]"
    @click="editable && emit('edit')"
  >
    <template v-if="frame === 'phone'">
      <span class="lp-device-btn lp-device-btn--silent" />
      <span class="lp-device-btn lp-device-btn--vol-up" />
      <span class="lp-device-btn lp-device-btn--vol-down" />
      <span class="lp-device-btn lp-device-btn--power" />
      <div class="lp-device-frame">
        <div class="lp-device-screen">
          <div class="lp-device-status">
            <span>9:41</span>
            <i class="lp-island" />
            <span class="lp-rails" aria-hidden="true">
              <i /><i /><i /><b />
            </span>
          </div>
          <img :src="image" alt="" />
          <div class="lp-device-ui">
            <a v-if="href && !editable" :href="href" class="lp-device-cta" target="_blank" rel="noreferrer">{{ label }}</a>
            <span v-else class="lp-device-cta">{{ label }}</span>
          </div>
          <i class="lp-home-bar" />
        </div>
      </div>
    </template>
    <template v-else>
      <span v-if="frame === 'emerge'" class="lp-portrait-well" aria-hidden="true" />
      <div class="lp-portrait-media">
        <img :src="image" alt="" />
      </div>
    </template>
    <span v-if="editable" class="lp-hotspot-hint">{{ hint }}</span>
  </figure>
</template>
