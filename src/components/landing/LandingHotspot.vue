<script setup lang="ts">
withDefaults(
  defineProps<{
    hint: string
    editable?: boolean
    active?: boolean
    block?: boolean
    bare?: boolean
  }>(),
  {
    editable: false,
    active: false,
    block: false,
    bare: false,
  },
)

const emit = defineEmits<{
  edit: []
}>()

function onClick(event: MouseEvent): void {
  emit('edit')
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <div
    class="lp-hotspot"
    :class="{ 'is-editable': editable, 'is-active': active, 'is-block': block, 'is-bare': bare }"
    @click="editable ? onClick($event) : undefined"
  >
    <slot />
    <span v-if="editable" class="lp-hotspot-hint">{{ hint }}</span>
  </div>
</template>
