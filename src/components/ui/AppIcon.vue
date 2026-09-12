<script setup lang="ts">
export type IconName =
  | 'users'
  | 'search'
  | 'folder'
  | 'gear'
  | 'bell'
  | 'user'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'zap'
  | 'file'
  | 'keyboard'
  | 'link'
  | 'check'
  | 'play'
  | 'pause'
  | 'alarm'
  | 'chevron'
  | 'menu'
  | 'close'
  | 'bag'
  | 'heart'
  | 'home'
  | 'star'
  | 'minus'
  | 'plus'
  | 'expand'
  | 'whatsapp'
  | 'download'
  | 'mail'
  | 'wallet'
  | 'chart'
  | 'calendar'
  | 'clipboard'

withDefaults(
  defineProps<{
    name: IconName
    size?: number
  }>(),
  { size: 18 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <g v-if="name === 'users'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3 2.7-5 5.5-5s4.9 2 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2c2.3.4 4 2.2 4.6 4.8" />
    </g>
    <g v-else-if="name === 'search'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.2 16.2 21 21" />
    </g>
    <g v-else-if="name === 'folder'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M3.5 7.5h6l1.6 2H20.5v9.5H3.5V7.5Z" />
      <path d="M3.5 9.5h17" />
    </g>
    <g v-else-if="name === 'gear'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13a7.8 7.8 0 0 0 .05-2l1.65-1.3-1.6-2.8-2 .5a7.7 7.7 0 0 0-1.7-1L15.5 4h-3.1l-.35 2.4a7.7 7.7 0 0 0-1.7 1l-2-.5-1.6 2.8L8.45 11a7.8 7.8 0 0 0 0 2l-1.7 1.3 1.6 2.8 2-.5a7.7 7.7 0 0 0 1.7 1l.35 2.4h3.1l.35-2.4a7.7 7.7 0 0 0 1.7-1l2 .5 1.6-2.8Z" />
    </g>
    <g v-else-if="name === 'bell'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </g>
    <g v-else-if="name === 'user'" stroke="currentColor" stroke-width="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.2-3.4 3.6-5 7-5s5.8 1.6 7 5" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'sun'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </g>
    <g v-else-if="name === 'moon'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M16.8 14.6A6.6 6.6 0 0 1 9.4 7.2 6.7 6.7 0 1 0 16.8 14.6Z" />
    </g>
    <g v-else-if="name === 'monitor'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
      <path d="M8 20h8M12 16.5V20" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'zap'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M13 3 5.8 13.2h5.4L11 21l7.4-11.4h-5.5L13 3Z" />
    </g>
    <g v-else-if="name === 'file'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V9h5.5" />
    </g>
    <g v-else-if="name === 'keyboard'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M7 11h.01M11 11h.01M15 11h.01M8.5 14.5h7" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'link'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M10 13a5 5 0 0 0 7.07.07l1.4-1.4a5 5 0 0 0-7.07-7.07L10 5.8" />
      <path d="M14 11a5 5 0 0 0-7.07-.07l-1.4 1.4a5 5 0 1 0 7.07 7.07L14 18.2" />
    </g>
    <g v-else-if="name === 'check'" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12.5 10 17.5 19 7.5" />
    </g>
    <g v-else-if="name === 'play'" fill="currentColor">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </g>
    <g v-else-if="name === 'pause'" fill="currentColor">
      <rect x="7" y="6" width="3.4" height="12" rx="1" />
      <rect x="13.6" y="6" width="3.4" height="12" rx="1" />
    </g>
    <g v-else-if="name === 'alarm'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3.2l2 1.3M5.2 5.2 7.5 7M18.8 5.2 16.5 7" />
    </g>
    <g v-else-if="name === 'chevron'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M9 6.5 14.5 12 9 17.5" />
    </g>
    <g v-else-if="name === 'menu'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
    <g v-else-if="name === 'close'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </g>
    <g v-else-if="name === 'bag'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </g>
    <g v-else-if="name === 'heart'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
    </g>
    <g v-else-if="name === 'home'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M4 11.5 12 4l8 7.5V20H4v-8.5Z" />
    </g>
    <g v-else-if="name === 'star'" fill="currentColor">
      <path d="M12 3.6 14.5 9l6 .7-4.5 4.1 1.3 5.8L12 16.8 6.7 19.6 8 13.8 3.5 9.7l6-.7L12 3.6Z" />
    </g>
    <g v-else-if="name === 'minus'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <path d="M6 12h12" />
    </g>
    <g v-else-if="name === 'plus'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <path d="M12 6v12M6 12h12" />
    </g>
    <g v-else-if="name === 'expand'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M14 6h4v4M10 18H6v-4M18 10 14 14M6 14l4-4" />
    </g>
    <g v-else-if="name === 'whatsapp'" fill="currentColor">
      <path d="M12 3.2A8.8 8.8 0 0 0 4.4 16.7L3.2 20.8l4.2-1.1A8.8 8.8 0 1 0 12 3.2Zm4.9 12.4c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.1-1.5 0-1.4-.3-3.1-1.1-5.1-3.1-1.6-1.6-2.6-3.5-2.9-4.1-.3-.6 0-1.3.3-1.6.2-.3.6-.5.9-.6h.7c.2 0 .5 0 .7.6l.9 2.1c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4 0 .7.5.8 1.4 1.7 2.3 2.3.3.2.5.2.7 0l.7-.7c.2-.2.5-.3.8-.1l2 1c.3.1.5.3.5.6 0 .2 0 .5-.1.7Z" />
    </g>
    <g v-else-if="name === 'download'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v10" />
      <path d="M8 10.5 12 15l4-4.5" />
      <path d="M5 19h14" />
    </g>
    <g v-else-if="name === 'mail'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'wallet'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="3.5" y="6" width="17" height="13" rx="2" />
      <path d="M3.5 10h17" />
      <circle cx="16.2" cy="14.2" r="1.1" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'chart'" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M4 19h16" />
      <path d="M7 16v-5M12 16V8M17 16v-8" />
    </g>
    <g v-else-if="name === 'calendar'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'clipboard'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5.5V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V5.5" />
      <path d="M9 11h6M9 15h4" stroke-linecap="round" />
    </g>
  </svg>
</template>
