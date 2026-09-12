<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import { fieldControlClass } from '@/utils/ui'
import type { Product } from '@/types/store'
import type { ReferralRow, TeamKind } from '@/types/mlm'

const props = defineProps<{
  open: boolean
  product: Product | null
  members: ReferralRow[]
  saving?: boolean
}>()

const emit = defineEmits<{
  close: []
  assign: [payload: { product_id: number; partner_user_id: number; quantity: number; notes?: string }]
}>()

const partnerId = ref<number | null>(null)
const quantity = ref(1)
const notes = ref('')

const assignable = computed(() =>
  props.members.filter((member) => Number(member.referred_id || member.referred?.id || 0) > 0),
)

const pendingInvite = computed(() =>
  props.members.filter((member) => member.kind === 'company' && !Number(member.referred_id || member.referred?.id || 0)),
)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return
    }
    partnerId.value = Number(assignable.value[0]?.referred_id || assignable.value[0]?.referred?.id || 0) || null
    quantity.value = 1
    notes.value = ''
  },
)

function kindLabel(kind?: TeamKind): string {
  if (kind === 'leader') {
    return 'Líder'
  }
  if (kind === 'company') {
    return 'Socio de empresa'
  }
  return 'Socio'
}

function memberId(member: ReferralRow): number {
  return Number(member.referred_id || member.referred?.id || 0)
}

function submit(): void {
  if (!props.product || !partnerId.value) {
    return
  }
  emit('assign', {
    product_id: props.product.id,
    partner_user_id: partnerId.value,
    quantity: Number(quantity.value || 0),
    notes: notes.value || undefined,
  })
}
</script>

<template>
  <div
    v-if="open && product"
    class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-md rounded-card bg-card p-5 shadow-lg">
      <h2 class="font-medium">Asignar {{ product.name }}</h2>
      <p class="mt-1 text-sm text-muted">
        Sales de tu bodega ({{ product.stock }} unidades) y se las entregas a un miembro del equipo. No es PV ni comisión SaaS: es control de tu inventario.
      </p>
      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <SoftField label="Miembro del equipo">
          <select v-model.number="partnerId" :class="fieldControlClass" required>
            <option v-if="!assignable.length" value="">Nadie con cuenta para asignar</option>
            <option v-for="member in assignable" :key="memberId(member)" :value="memberId(member)">
              {{ member.name || member.referred?.name }} · {{ kindLabel(member.kind) }}
            </option>
          </select>
        </SoftField>
        <p v-if="pendingInvite.length" class="text-xs text-muted">
          Socios de empresa sin cuenta (invítalos en Equipo para asignarles stock):
          {{ pendingInvite.map((item) => item.name).join(', ') }}
        </p>
        <SoftField label="Unidades">
          <input v-model.number="quantity" :class="fieldControlClass" type="number" min="1" :max="product.stock" required />
        </SoftField>
        <SoftField label="Nota (opcional)">
          <input v-model="notes" :class="fieldControlClass" placeholder="Ej. Entrega del 3 de septiembre" />
        </SoftField>
        <div class="flex justify-end gap-2 pt-2">
          <SoftButton variant="outline" type="button" @click="emit('close')">Cancelar</SoftButton>
          <SoftButton type="submit" :disabled="saving || !partnerId">Asignar</SoftButton>
        </div>
      </form>
    </div>
  </div>
</template>
