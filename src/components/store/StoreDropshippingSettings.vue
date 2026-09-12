<script setup lang="ts">
import { computed } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import SettingsBlock from '@/components/store/SettingsBlock.vue'
import { fieldControlClass } from '@/utils/ui'
import {
  SHIPPING_COUNTRIES,
  departmentsOf,
  type DropshippingSettings,
  type ShippingZone,
} from '@/data/shipping'

const model = defineModel<DropshippingSettings>({ required: true })

const originDepartments = computed(() => departmentsOf(model.value.origin_country))

function addZone(): void {
  model.value.zones.push({
    country: model.value.origin_country || 'BO',
    department: model.value.origin_department,
    area: '',
    fee: 0,
    eta_days: 2,
    label: '',
  })
}

function removeZone(index: number): void {
  model.value.zones.splice(index, 1)
}

function zoneDepartments(zone: ShippingZone): string[] {
  return departmentsOf(zone.country)
}
</script>

<template>
  <div class="space-y-4">
    <SettingsBlock
      tone="charcoal"
      icon="bag"
      title="Dropshipping y envíos"
      body="El comprador elige país, departamento y área. Las tarifas están en la moneda de la tienda. Se cobra la tarifa más específica: área local, luego departamento, país o internacional. Si hay envío gratis por monto, no se suma comisión."
    >
      <label class="flex items-center gap-2 text-sm">
        <input v-model="model.enabled" type="checkbox" />
        Activar cálculo de envío en el checkout
      </label>
    </SettingsBlock>

    <SettingsBlock
      tone="sky"
      icon="home"
      title="Origen del pedido"
      body="País, departamento y barrio desde donde sale la mercancía (bodega o proveedor)."
    >
      <div class="grid gap-4 md:grid-cols-3">
        <SoftField label="País de origen">
          <select v-model="model.origin_country" :class="fieldControlClass">
            <option v-for="country in SHIPPING_COUNTRIES" :key="country.code" :value="country.code">
              {{ country.name }}
            </option>
          </select>
        </SoftField>
        <SoftField label="Departamento de origen">
          <input
            v-if="!originDepartments.length"
            v-model="model.origin_department"
            :class="fieldControlClass"
            placeholder="Departamento o estado"
          />
          <select v-else v-model="model.origin_department" :class="fieldControlClass">
            <option value="">—</option>
            <option v-for="item in originDepartments" :key="item" :value="item">{{ item }}</option>
          </select>
        </SoftField>
        <SoftField label="Área local de origen" hint="Ciudad, zona o barrio desde donde sale el pedido.">
          <input v-model="model.origin_area" :class="fieldControlClass" placeholder="Ej. El Alto, Zona Sur" />
        </SoftField>
      </div>
    </SettingsBlock>

    <SettingsBlock
      tone="amber"
      icon="wallet"
      title="Comisiones por defecto"
      body="Se usan cuando no hay una zona más específica en la tabla."
    >
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SoftField label="Área local (mismo barrio/ciudad)">
          <input v-model.number="model.local_fee" :class="fieldControlClass" type="number" min="0" step="0.01" />
        </SoftField>
        <SoftField label="Mismo departamento">
          <input v-model.number="model.department_fee" :class="fieldControlClass" type="number" min="0" step="0.01" />
        </SoftField>
        <SoftField label="Nacional (otro departamento)">
          <input v-model.number="model.national_fee" :class="fieldControlClass" type="number" min="0" step="0.01" />
        </SoftField>
        <SoftField label="Internacional">
          <input v-model.number="model.international_fee" :class="fieldControlClass" type="number" min="0" step="0.01" />
        </SoftField>
        <SoftField label="Días área local">
          <input v-model.number="model.local_days" :class="fieldControlClass" type="number" min="0" />
        </SoftField>
        <SoftField label="Días departamento">
          <input v-model.number="model.department_days" :class="fieldControlClass" type="number" min="0" />
        </SoftField>
        <SoftField label="Días nacional">
          <input v-model.number="model.national_days" :class="fieldControlClass" type="number" min="0" />
        </SoftField>
        <SoftField label="Días internacional">
          <input v-model.number="model.international_days" :class="fieldControlClass" type="number" min="0" />
        </SoftField>
      </div>
    </SettingsBlock>

    <SettingsBlock
      tone="emerald"
      icon="plus"
      title="Manejo y envío gratis"
      body="El manejo se suma al envío, salvo que el pedido alcance el umbral de envío gratis."
    >
      <div class="grid gap-3 sm:grid-cols-2">
        <SoftField label="Manejo / empaque">
          <input v-model.number="model.handling_fee" :class="fieldControlClass" type="number" min="0" step="0.01" />
        </SoftField>
        <SoftField label="Envío gratis desde (subtotal)" hint="Vacío = nunca gratis.">
          <input
            :value="model.free_shipping_from ?? ''"
            :class="fieldControlClass"
            type="number"
            min="0"
            step="0.01"
            placeholder="Sin umbral"
            @input="model.free_shipping_from = ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value)"
          />
        </SoftField>
      </div>
    </SettingsBlock>

    <SettingsBlock
      tone="violet"
      icon="star"
      title="Zonas especiales"
      body="Ganan a las tarifas por defecto. Completa solo país para todo el país; país + departamento; o los tres para un área local."
    >
      <div class="mb-3 flex justify-end">
        <SoftButton variant="outline" type="button" @click="addZone">Añadir zona</SoftButton>
      </div>
      <p v-if="!model.zones.length" class="text-sm text-muted">Sin zonas. Se usarán las comisiones por defecto.</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-b border-line">
              <th class="py-2 font-medium">País</th>
              <th class="py-2 font-medium">Departamento</th>
              <th class="py-2 font-medium">Área local</th>
              <th class="py-2 font-medium">Comisión</th>
              <th class="py-2 font-medium">Días</th>
              <th class="py-2 font-medium">Etiqueta</th>
              <th class="py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(zone, index) in model.zones" :key="index" class="border-b border-line last:border-0">
              <td class="py-2 pr-2">
                <select v-model="zone.country" :class="fieldControlClass">
                  <option v-for="country in SHIPPING_COUNTRIES" :key="country.code" :value="country.code">
                    {{ country.name }}
                  </option>
                </select>
              </td>
              <td class="py-2 pr-2">
                <select v-if="zoneDepartments(zone).length" v-model="zone.department" :class="fieldControlClass">
                  <option value="">Todo el país</option>
                  <option v-for="item in zoneDepartments(zone)" :key="item" :value="item">{{ item }}</option>
                </select>
                <input v-else v-model="zone.department" :class="fieldControlClass" placeholder="Opcional" />
              </td>
              <td class="py-2 pr-2">
                <input v-model="zone.area" :class="fieldControlClass" placeholder="Opcional" />
              </td>
              <td class="py-2 pr-2">
                <input v-model.number="zone.fee" :class="fieldControlClass" class="w-24" type="number" min="0" step="0.01" />
              </td>
              <td class="py-2 pr-2">
                <input v-model.number="zone.eta_days" :class="fieldControlClass" class="w-20" type="number" min="0" />
              </td>
              <td class="py-2 pr-2">
                <input v-model="zone.label" :class="fieldControlClass" placeholder="Ej. La Paz centro" />
              </td>
              <td class="py-2">
                <SoftButton variant="ghost" type="button" @click="removeZone(index)">Quitar</SoftButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SettingsBlock>

    <SettingsBlock
      tone="charcoal"
      icon="clipboard"
      title="Notas para el comprador"
      body="Se muestran en el checkout. Útiles para tiempos de dropshipping o retiro en tienda."
    >
      <SoftField label="Mensaje">
        <textarea
          v-model="model.notes"
          :class="fieldControlClass"
          rows="3"
          placeholder="Ej. Pedidos dropshipping salen del proveedor en 24 h. Recoge en tienda sin costo."
        />
      </SoftField>
    </SettingsBlock>
  </div>
</template>
