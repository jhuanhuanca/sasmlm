<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { legalNav } from '@/data/legal'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const menuOpen = ref(false)

function closeMenu(): void {
  menuOpen.value = false
}

function scrollTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="mk-root">
    <header class="mk-nav">
      <div class="mk-wrap mk-nav-inner">
        <RouterLink to="/" class="mk-brand" aria-label="REXmlm">
          <BrandLogo surface="light" height-class="h-9" />
          <span class="mk-brand-tag">software de operación comercial</span>
        </RouterLink>
        <nav class="mk-links" aria-label="Principal">
          <a href="/#herramientas">Producto</a>
          <a href="/#paquetes">Planes</a>
          <RouterLink to="/legal/terminos">Legal</RouterLink>
        </nav>
        <div class="flex items-center gap-3">
          <RouterLink v-if="auth.isAuthenticated" class="mk-btn" to="/app">Entrar al panel</RouterLink>
          <template v-else>
            <RouterLink class="mk-btn-ghost max-md:hidden" to="/register">Crear cuenta</RouterLink>
            <RouterLink class="mk-btn" to="/login">Iniciar sesión</RouterLink>
          </template>
          <button class="mk-menu-btn" type="button" aria-label="Menú" @click="menuOpen = !menuOpen">☰</button>
        </div>
      </div>
      <div class="mk-wrap mk-mobile" :class="{ 'is-open': menuOpen }">
        <a href="/#herramientas" @click="closeMenu">Producto</a>
        <a href="/#paquetes" @click="closeMenu">Planes</a>
        <RouterLink to="/legal/terminos" @click="closeMenu">Legal</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/app" @click="closeMenu">Entrar al panel</RouterLink>
        <template v-else>
          <RouterLink to="/login" @click="closeMenu">Iniciar sesión</RouterLink>
          <RouterLink to="/register" @click="closeMenu">Crear cuenta</RouterLink>
        </template>
      </div>
    </header>

    <slot />

    <footer class="mk-footer">
      <div class="mk-wrap">
        <div class="mk-center">
          <BrandLogo surface="dark" height-class="h-10" tagline />
        </div>
        <div class="mk-footer-grid">
          <div>
            <small>Producto</small>
            <p>SaaS de catálogo, tienda, página y equipo. Los planes de plataforma los cobra Paddle como comerciante registrado.</p>
          </div>
          <div>
            <small>Legal</small>
            <p class="mk-footer-legal">
              <RouterLink v-for="item in legalNav" :key="item.slug" :to="`/legal/${item.slug}`" class="text-white">
                {{ item.title }}
              </RouterLink>
            </p>
          </div>
          <div>
            <small>Acceso</small>
            <p>
              <RouterLink to="/login" class="text-white">Entrar</RouterLink>
              ·
              <RouterLink to="/register" class="text-white">Crear cuenta</RouterLink>
              ·
              <a class="text-white" href="mailto:hola@rexmlm.tech">hola@rexmlm.tech</a>
            </p>
          </div>
        </div>
        <div class="mk-footer-bottom">
          <p>REXmlm · Software de suscripción. Pagos de planes procesados por Paddle.</p>
          <p>© {{ new Date().getFullYear() }} REXmlm</p>
        </div>
      </div>
    </footer>

    <button class="mk-top" type="button" aria-label="Volver arriba" @click="scrollTop">↑</button>
  </div>
</template>
