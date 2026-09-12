export type DinoTourId =
  | 'leader-dashboard'
  | 'partner-dashboard'
  | 'team'
  | 'invitations'
  | 'store'
  | 'landing'
  | 'tools'
  | 'commissions'
  | 'closing'
  | 'profile'
  | 'become-leader'

export type TourTone =
  | 'green'
  | 'gold'
  | 'orange'
  | 'coral'
  | 'sky'
  | 'mint'
  | 'royal'
  | 'lavender'
  | 'yellow'
  | 'ink'

export type DinoTourPanel = 'network' | 'store' | 'landing' | 'tools' | 'plan'

export type DinoTourStep = {
  id: string
  target: string
  title: string
  body: string
  optional?: boolean
  panel?: DinoTourPanel
}

export type DinoTour = {
  tone: TourTone
  launcher: string
  steps: DinoTourStep[]
}

export const tourToneVars: Record<TourTone, { bubble: string; ink: string; shadow: string }> = {
  green: { bubble: '#3ecf4a', ink: '#ffffff', shadow: 'rgba(20, 90, 30, 0.55)' },
  gold: { bubble: '#c9a227', ink: '#1c1608', shadow: 'rgba(120, 90, 20, 0.4)' },
  orange: { bubble: '#ff9a3c', ink: '#2a1608', shadow: 'rgba(180, 80, 10, 0.38)' },
  coral: { bubble: '#ff6b6b', ink: '#ffffff', shadow: 'rgba(160, 40, 50, 0.42)' },
  sky: { bubble: '#3bb8e8', ink: '#ffffff', shadow: 'rgba(20, 90, 140, 0.42)' },
  mint: { bubble: '#2db87a', ink: '#ffffff', shadow: 'rgba(20, 100, 60, 0.42)' },
  royal: { bubble: '#3b6bff', ink: '#ffffff', shadow: 'rgba(20, 40, 140, 0.48)' },
  lavender: { bubble: '#8b6fd4', ink: '#ffffff', shadow: 'rgba(70, 40, 140, 0.48)' },
  yellow: { bubble: '#ffd452', ink: '#202020', shadow: 'rgba(160, 120, 20, 0.38)' },
  ink: { bubble: '#2a2a30', ink: '#fffef8', shadow: 'rgba(0, 0, 0, 0.45)' },
}

export const lightTones: TourTone[] = ['gold', 'orange', 'yellow']

export const dinoTours: Record<DinoTourId, DinoTour> = {
  'leader-dashboard': {
    tone: 'green',
    launcher: '¿Te explico el panel?',
    steps: [
      {
        id: 'welcome',
        target: 'dash-welcome',
        title: 'Hola, soy Rex',
        body: 'Estuve pensando cómo presentarte el panel. Te marco cada bloque y te digo para qué sirve. Lo importante: ventas de tu tienda y PV de la empresa no se mezclan.',
      },
      {
        id: 'nav',
        target: 'app-nav',
        title: 'Tu menú de trabajo',
        body: 'Arriba están los módulos. Cada uno tiene su propio recorrido de color: Equipo, Invitaciones, Tienda, Landing, Herramientas, Comisiones y Cierre. Entra y te lo explico ahí.',
      },
      {
        id: 'pulse',
        target: 'dash-pulse',
        title: 'El pulso del mes',
        body: 'Equipo es toda tu red. Directos son quienes invitaste tú. Ventas del mes son pedidos pagados de tu tienda (plano A). El rango solo aparece si la empresa cargó el dato.',
      },
      {
        id: 'profile',
        target: 'dash-profile',
        title: 'Tu ficha',
        body: 'Aquí estás tú: nombre, rol y la comisión pendiente cuando un socio se hace líder. Ese dinero es de plataforma, no un bono de producto.',
        optional: true,
      },
      {
        id: 'shortcuts',
        target: 'dash-shortcuts',
        title: 'Atajos sin salir de aquí',
        body: 'Red actual es tu network. Tienda es el e-commerce. Landing capta gente nueva. Ábrelos aquí o desde el menú si quieres editarlos.',
        panel: 'store',
        optional: true,
      },
      {
        id: 'tools',
        target: 'dash-shortcuts',
        title: 'Herramientas para asesorar',
        body: 'Bienestar, IMC y material para un cliente o un socio. No sustituyen una consulta médica. El kit completo está en Herramientas.',
        panel: 'tools',
        optional: true,
      },
      {
        id: 'charts',
        target: 'dash-charts',
        title: 'Dos dineros, dos gráficos',
        body: 'Ventas y comisión SaaS a un lado (plano A) y PV/GV al otro (plano B). No se suman. Si aún no hay serie, este paso se salta.',
        optional: true,
      },
      {
        id: 'closing',
        target: 'dash-closing',
        title: 'Cómo va el cierre',
        body: 'En el centro ves el mes: volumen de empresa si existe, altas de la semana, el anillo de ciclo o rango y quién acaba de entrar. Nada de esto inventa PV en cero.',
        optional: true,
      },
      {
        id: 'tasks',
        target: 'dash-tasks',
        title: 'Para dejar el panel listo',
        body: 'Invitar, publicar landing, revisar tienda y cargar catálogo. El porcentaje es tu arranque, no un rango MLM. En cada módulo, tócame la cara si quieres que te lo explique otra vez.',
        optional: true,
      },
    ],
  },
  'partner-dashboard': {
    tone: 'green',
    launcher: '¿Te explico el panel?',
    steps: [
      {
        id: 'welcome',
        target: 'dash-welcome',
        title: 'Hola, soy Rex',
        body: 'Trabajas en la red de un líder, todavía sin plan propio. Te marco lo que sí puedes usar hoy y cómo dar el siguiente paso.',
      },
      {
        id: 'nav',
        target: 'app-nav',
        title: 'Lo que ves arriba',
        body: 'Dashboard es esta pantalla. Landing y Tienda abren las páginas de tu líder. Herramientas te sirven para asesorar. Volverse líder es el plan.',
      },
      {
        id: 'tools',
        target: 'partner-tools',
        title: 'Herramientas',
        body: 'Protocolos de bienestar, IMC y material para compartir. Úsalas con un comprador o con alguien que quieras invitar.',
      },
      {
        id: 'share',
        target: 'partner-share',
        title: 'Landing y tienda del líder',
        body: 'No tienes vitrina propia todavía. Comparte las de tu líder con tu referido para que altas y ventas te atribuyan a ti.',
      },
      {
        id: 'leader',
        target: 'partner-leader',
        title: 'Cuando quieras equipo propio',
        body: 'Volverse líder activa tu suscripción, tu red, tu landing y tu tienda. Hasta entonces operas como socio.',
      },
    ],
  },
  team: {
    tone: 'gold',
    launcher: '¿Te explico Equipo?',
    steps: [
      {
        id: 'welcome',
        target: 'team-welcome',
        title: 'Equipo, tres tipos',
        body: 'Socio (amarillo, sin plan), líder (negro, con suscripción) y socio de empresa (azul, red de tu marca). No se mezclan. Las ventas de la tabla son de tu tienda, no PV.',
      },
      {
        id: 'kpis',
        target: 'team-kpis',
        title: 'Los números de tu red',
        body: 'Socios, líderes independientes, socios de empresa, ventas del mes de tu tienda y seguimientos CRM pendientes. El CRM es solo de la red de plataforma.',
      },
      {
        id: 'add',
        target: 'team-welcome',
        title: 'Añadir persona',
        body: 'Invitas un socio de plataforma (correo y enlace de una sola vez) o registras a mano un socio de empresa. Convertir a socio manda invitación: no crea un líder.',
      },
      {
        id: 'filters',
        target: 'team-filters',
        title: 'Filtra por color',
        body: 'Todos, socios, líderes, empresa o a quienes debes dar seguimiento hoy. El borde de cada fila repite el color del tipo.',
      },
      {
        id: 'table',
        target: 'team-table',
        title: 'La lista unificada',
        body: 'Nombre, tipo, su equipo, ventas del mes, CRM o rango de marca, y fecha de alta. Entra a una persona de plataforma para ver pedidos y seguimiento.',
      },
    ],
  },
  invitations: {
    tone: 'orange',
    launcher: '¿Te explico Invitaciones?',
    steps: [
      {
        id: 'welcome',
        target: 'invite-welcome',
        title: 'Cómo crece la red',
        body: 'Desde aquí invitas socios de plataforma. El token en claro aparece una sola vez: si lo pierdes, genera otra invitación.',
      },
      {
        id: 'form',
        target: 'invite-form',
        title: 'Enviar el correo',
        body: 'Escribe el correo del socio y envía. También puedes copiar el enlace y mandarlo por WhatsApp. Cuando acepte, lo ves en Equipo.',
      },
      {
        id: 'after',
        target: 'invite-after',
        title: 'Qué pasa después',
        body: 'El socio abre el enlace, crea su cuenta y queda en tu red como socio (sin plan). Si más adelante se suscribe, se vuelve líder y tú ganas la comisión de referido.',
      },
    ],
  },
  store: {
    tone: 'coral',
    launcher: '¿Te explico la tienda?',
    steps: [
      {
        id: 'welcome',
        target: 'store-welcome',
        title: 'Tu e-commerce',
        body: 'Inventario personal y, aparte, productos de empresa que tú eliges publicar. El dashboard y el cierre solo cuentan órdenes pagadas, no PV.',
      },
      {
        id: 'sales',
        target: 'store-sales',
        title: 'Ventas personales y del equipo',
        body: 'Personales: tú vendiste. Equipo: cerró alguien de tu red en tu tienda. Total pagado suma ambas. Pulsa una tarjeta para filtrar órdenes.',
        optional: true,
      },
      {
        id: 'tabs',
        target: 'store-tabs',
        title: 'Tres pestañas',
        body: 'Inventario: catálogo y stock. Órdenes: pedidos y pago. Ajustes: nombre, WhatsApp y dropshipping (zonas y tarifas de envío).',
      },
      {
        id: 'shelf',
        target: 'store-shelf',
        title: 'Dos estantes',
        body: 'Inventario personal lo cargas tú (stock, vencimiento, CSV). Empresa es el catálogo de tu marca: publicas o retiras, no lo editas como si fuera tuyo.',
        optional: true,
      },
    ],
  },
  landing: {
    tone: 'sky',
    launcher: '¿Te explico la landing?',
    steps: [
      {
        id: 'welcome',
        target: 'landing-welcome',
        title: 'Tu página pública',
        body: 'Sirve para captar socios y clientes. Cuando publicas, cualquiera abre /l/tu-slug. Despublicar la deja en borrador.',
      },
      {
        id: 'hero',
        target: 'landing-hero',
        title: 'Hero y WhatsApp',
        body: 'Clic en el celular, el botón Cambiar fondo, We Created o la segunda foto de abajo. A la derecha subes cada imagen o editas el texto.',
        optional: true,
      },
      {
        id: 'blocks',
        target: 'landing-blocks',
        title: 'Bloques y publicar',
        body: 'Abajo del hero puedes añadir texto, imagen o un botón a tu tienda. Guarda y publica cuando la vista previa te guste.',
        optional: true,
      },
    ],
  },
  tools: {
    tone: 'mint',
    launcher: '¿Te explico las herramientas?',
    steps: [
      {
        id: 'welcome',
        target: 'tools-welcome',
        title: 'Kit para asesorar',
        body: 'Recursos para hablar con un cliente o un socio. No reemplazan una consulta médica. Cada tarjeta abre una herramienta.',
      },
      {
        id: 'grid',
        target: 'tools-grid',
        title: 'Qué hay en el kit',
        body: 'Bienestar: protocolos de tu empresa. IMC: paquetes de peso del catálogo. Consulta, flyers, PDFs, videos y audios para compartir. WhatsApp: extensión para grupos.',
      },
    ],
  },
  commissions: {
    tone: 'royal',
    launcher: '¿Te explico comisiones?',
    steps: [
      {
        id: 'welcome',
        target: 'comm-welcome',
        title: 'Comisión de referido',
        body: 'Ganas un porcentaje cuando un socio que invitaste se suscribe como líder. No es bono de producto ni venta de tienda.',
      },
      {
        id: 'balance',
        target: 'comm-balance',
        title: 'Disponible para retiro',
        body: 'Aquí ves lo que ya puedes cobrar, lo pendiente y lo reservado en una solicitud. Hay un mínimo. Administración te contacta para el depósito.',
        optional: true,
      },
      {
        id: 'list',
        target: 'comm-list',
        title: 'Historial',
        body: 'Cada comisión y cada solicitud de retiro. Pendiente, pagada o rechazada. El WhatsApp de la solicitud es para que te localicen, no para cobrar en la app.',
        optional: true,
      },
    ],
  },
  closing: {
    tone: 'lavender',
    launcher: '¿Te explico el cierre?',
    steps: [
      {
        id: 'welcome',
        target: 'close-welcome',
        title: 'Cierre de tu red',
        body: 'Es el mes de tu operación, no el backoffice de la empresa ni el de otros líderes. Ventas de tienda y comisión SaaS van aparte del volumen de empresa.',
      },
      {
        id: 'period',
        target: 'close-period',
        title: 'Periodo y CSV',
        body: 'La zona horaria es la de tu país (si no hay, La Paz). Anterior cambia el mes. CSV baja el reporte para tu contable.',
      },
      {
        id: 'company',
        target: 'close-company',
        title: 'Datos de empresa',
        body: 'El dato oficial lo carga administración (conector). Si tu red aún no está ahí, subes un Excel solo de tu red. Si no hay PV, no mostramos un 0 fingido.',
        optional: true,
      },
      {
        id: 'volume',
        target: 'close-volume',
        title: 'Plano B: volumen',
        body: 'Personal y de grupo según la empresa, más rango si existe. Metas de tienda y de volumen se editan por separado. Nunca se mezclan con GMV.',
        optional: true,
      },
    ],
  },
  profile: {
    tone: 'ink',
    launcher: '¿Te explico ajustes?',
    steps: [
      {
        id: 'welcome',
        target: 'profile-welcome',
        title: 'Tu cuenta',
        body: 'Datos de sesión, red y apariencia. La paleta se guarda en este navegador, no en el servidor.',
      },
      {
        id: 'account',
        target: 'profile-account',
        title: 'Quién eres aquí',
        body: 'Nombre, correo, rol, red y empresa/rango de catálogo si administración los cargó. Cerrar sesión vale cuando usas un equipo compartido.',
      },
      {
        id: 'look',
        target: 'profile-look',
        title: 'Apariencia',
        body: 'Claro u oscuro y la paleta del panel. Sirve para alinear el dashboard con tu marca sin tocar el código.',
        optional: true,
      },
    ],
  },
  'become-leader': {
    tone: 'yellow',
    launcher: '¿Te explico el plan?',
    steps: [
      {
        id: 'welcome',
        target: 'plan-welcome',
        title: 'Volverse líder',
        body: 'Eliges un plan, activas tu red y pasas a tener equipo, landing y tienda. Tu líder actual gana la comisión de referido de esa suscripción.',
      },
      {
        id: 'plans',
        target: 'plan-grid',
        title: 'Compara e inscríbete',
        body: 'Cada tarjeta es un plan SaaS, no un rango de la empresa. Elige uno y confirma. Después invitas a tu primer socio desde Equipo.',
        optional: true,
      },
    ],
  },
}

const routeTour: Record<string, DinoTourId> = {
  dashboard: 'leader-dashboard',
  team: 'team',
  invitations: 'invitations',
  store: 'store',
  landing: 'landing',
  tools: 'tools',
  commissions: 'commissions',
  'monthly-closing': 'closing',
  profile: 'profile',
  'become-leader': 'become-leader',
}

export function tourIdForRoute(
  routeName: string | symbol | null | undefined,
  isPartnerOnly: boolean,
): DinoTourId | null {
  const name = String(routeName ?? '')
  if (name === 'dashboard') {
    return isPartnerOnly ? 'partner-dashboard' : 'leader-dashboard'
  }

  return routeTour[name] ?? null
}

export function isLightTone(tone: TourTone): boolean {
  return lightTones.includes(tone)
}
