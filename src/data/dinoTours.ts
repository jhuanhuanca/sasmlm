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
  | 'support'

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
  reveal?: string
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
        body: 'Bienvenida a tu oficina. Aquí no se mezcla el dinero de tu tienda con el volumen (PV) de la marca. Te voy a señalar cada botón, con calma, como si fuera tu primer día. Si te pierdes, toca mi cara o el botón de play arriba a la derecha y lo repetimos.',
      },
      {
        id: 'nav',
        target: 'app-nav',
        title: 'Las puertas de tu negocio',
        body: 'Arriba está el menú. Dashboard es el resumen. Equipo son las personas. Invitaciones manda el correo para sumar un socio. Tienda es tu e-commerce. Landing es tu página pública. Herramientas te ayudan a asesorar. Comisiones es el 10 % cuando alguien se hace líder. Cierre de mes es el reporte. Soporte escribe a la plataforma.',
      },
      {
        id: 'tools',
        target: 'app-tools',
        title: 'Play, sol, campana y tu foto',
        body: 'El play (triángulo) vuelve a abrir esta guía. El sol o la luna cambia claro/oscuro. La campana avisa stock bajo o vencimientos. Tu foto abre Ajustes y Cerrar sesión. En el celular, las tres rayitas abren el mismo menú.',
      },
      {
        id: 'company',
        target: 'company-scope',
        title: 'Tu empresa activa',
        body: 'Si trabajas con más de una marca, aquí eliges cuál estás viendo. Añadir empresa suma otra (la del alta es gratis; cada extra se cobra). La landing y la tienda pública no cambian: solo el catálogo, equipo y herramientas de esa marca.',
        optional: true,
        reveal: 'add-company',
      },
      {
        id: 'pulse',
        target: 'dash-pulse',
        title: 'El pulso del mes',
        body: 'Equipo = toda tu red. Directos = a quienes invitaste tú. Ventas del mes = pedidos ya pagados de tu tienda, no puntos de la empresa. El rango de la marca solo aparece si administración lo cargó.',
      },
      {
        id: 'profile',
        target: 'dash-profile',
        title: 'Tu ficha',
        body: 'Eres tú: nombre y rol. El número de arriba a la derecha es comisión pendiente de plataforma (cuando un socio se suscribe como líder). No es un bono de producto.',
        optional: true,
      },
      {
        id: 'store',
        target: 'dash-shortcuts',
        title: 'Ver tu e-commerce',
        body: 'Abre Tienda: ves el nombre y el enlace /s/tu-tienda. Abrir tienda la muestra como la ve un cliente. Para crear productos, publicar el catálogo o vender, entra al menú Tienda: ahí te guío paso a paso.',
        panel: 'store',
        optional: true,
      },
      {
        id: 'landing',
        target: 'dash-shortcuts',
        title: 'Ver tu landing',
        body: 'Abre Landing: te dice si está publicada o en borrador. Abrir landing es lo que ve el mundo en /l/tu-nombre. Para cambiar foto, logo o textos, entra al menú Landing y toca lo que quieras editar.',
        panel: 'landing',
        optional: true,
      },
      {
        id: 'kit',
        target: 'dash-shortcuts',
        title: 'Herramientas para asesorar',
        body: 'Protocolos de bienestar, IMC y material para compartir. No sustituyen una consulta médica. El kit completo está en el menú Herramientas.',
        panel: 'tools',
        optional: true,
      },
      {
        id: 'charts',
        target: 'dash-charts',
        title: 'Dos dineros, dos gráficos',
        body: 'A un lado: ventas de tu tienda y comisión SaaS. Al otro: PV/GV de la empresa, si existe. Nunca se suman. Si aún no hay números, este paso se salta.',
        optional: true,
      },
      {
        id: 'closing',
        target: 'dash-closing',
        title: 'Cómo va el cierre',
        body: 'El centro es el mes: volumen de marca si hay dato, altas de la semana y quién acaba de entrar. Si no hay PV, no inventamos un cero.',
        optional: true,
      },
      {
        id: 'tasks',
        target: 'dash-tasks',
        title: 'Para dejar todo listo',
        body: 'Invitar un socio, publicar la landing, mirar la tienda y cargar catálogo. El porcentaje es tu arranque, no un rango MLM. En cada módulo, tómame de la mano otra vez: te explico crear producto, vender, incentivos e invitar.',
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
        body: 'Eres socio: trabajas en la red de un líder, todavía sin tu propia tienda ni landing. Te marco lo que sí puedes usar hoy y cómo dar el siguiente paso cuando quieras equipo propio.',
      },
      {
        id: 'nav',
        target: 'app-nav',
        title: 'Lo que ves arriba',
        body: 'Dashboard es esta pantalla. Landing y Tienda abren las páginas públicas de tu líder (en otra pestaña). Herramientas te sirven para asesorar. Volverse líder es el plan de suscripción. El play vuelve a abrir esta guía.',
      },
      {
        id: 'tools',
        target: 'partner-tools',
        title: 'Herramientas',
        body: 'Toca esta tarjeta. Entras a protocolos de bienestar, IMC, flyers, PDFs, videos y audios. Úsalas con un comprador o con alguien que quieras invitar. No reemplazan al médico.',
      },
      {
        id: 'share',
        target: 'partner-share',
        title: 'Landing y e-commerce del líder',
        body: 'Aún no tienes vitrina propia. Comparte la landing y la tienda de tu líder. La tienda lleva tu referido (ref): si alguien compra, la venta te atribuye a ti. Ábrelas para verlas como las ve un cliente.',
      },
      {
        id: 'leader',
        target: 'partner-leader',
        title: 'Cuando quieras tu negocio',
        body: 'Volverse líder es pagar el plan de la plataforma. Ahí naces tu red, tu landing y tu tienda. Tu líder gana la comisión de referido. Hasta entonces operas como socio, sin inventario propio.',
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
        title: 'Tu gente, en tres colores',
        body: 'Socio (amarillo): ya tiene cuenta, todavía no paga plan. Líder (negro): ya se suscribió y tiene su propia red. Socio de empresa (azul): lo registras a mano en la red de tu marca, sin cuenta de esta plataforma. Las ventas de la tabla son de tu tienda, no PV.',
      },
      {
        id: 'company',
        target: 'company-scope',
        title: 'Empresa y añadir otra',
        body: 'Arriba eliges con qué marca estás trabajando el equipo. Añadir empresa abre el formulario para sumar otra marca (se cobra la secundaria). La del registro original no se cobra otra vez.',
        optional: true,
        reveal: 'add-company',
      },
      {
        id: 'add',
        target: 'team-add',
        title: 'El botón Añadir persona',
        body: 'Este botón amarillo abre el formulario. Ahí eliges: invitar un socio de plataforma (le llega un correo) o registrar un socio de empresa (alta manual, sin cuenta). Tócalo cuando quieras sumar a alguien.',
      },
      {
        id: 'invite',
        target: 'team-invite-form',
        title: 'Invitar un socio',
        body: 'Escribe el correo y pulsa Enviar invitación. Le llega un enlace de una sola vez. Si no llega el mail, vuelve a enviar el mismo correo. También puedes copiar el enlace y mandarlo por WhatsApp. Cuando acepte, aparece aquí como socio.',
        reveal: 'invite-partner',
      },
      {
        id: 'company-partner',
        target: 'team-invite-form',
        title: 'Registrar en la empresa',
        body: 'Cambia a Socio de empresa. Pones nombre, correo, WhatsApp y, si quieres, código y rango de la marca. Registrar en la empresa no le crea usuario aquí. Más adelante, Convertir a socio le manda invitación para que sí tenga cuenta.',
        reveal: 'invite-company',
      },
      {
        id: 'kpis',
        target: 'team-kpis',
        title: 'Los números de tu red',
        body: 'Cinco tarjetas: cuántos socios, cuántos líderes, cuántos de empresa, cuánto vendió el equipo este mes en tu tienda, y seguimientos CRM pendientes. El CRM es solo para socios y líderes de plataforma.',
      },
      {
        id: 'filters',
        target: 'team-filters',
        title: 'Filtra por tipo',
        body: 'Todos, Socios, Líderes, Empresa o Seguimiento. Cada botón deja ver solo ese grupo. El borde de color en la tabla repite el tipo, para no mezclarlos.',
      },
      {
        id: 'table',
        target: 'team-table',
        title: 'La lista',
        body: 'Nombre, tipo, su equipo, ventas del mes, CRM o rango de marca, y fecha de alta. Entra a una persona de plataforma para ver pedidos y notas. Los reportes de abajo descargan Excel de referidos o de empresa.',
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
        body: 'Esta pantalla es solo para invitar socios de plataforma (gente que va a tener cuenta). Si quieres registrar a alguien de tu marca sin cuenta, eso se hace en Equipo → Añadir persona → Socio de empresa.',
      },
      {
        id: 'form',
        target: 'invite-form',
        title: 'El botón Enviar invitación',
        body: 'Escribe el correo y envía. El sistema manda el email con el enlace de registro. Si no llega, usa el mismo correo otra vez: se reenvía. El token en claro aparece una sola vez a la derecha: si lo pierdes, genera otra invitación.',
      },
      {
        id: 'after',
        target: 'invite-after',
        title: 'Qué pasa después',
        body: '1) La persona abre el correo o el enlace. 2) Crea su cuenta y queda en tu red como socio (aún sin pagar plan). 3) Lo ves en Equipo y le das seguimiento. Si más adelante se suscribe, se vuelve líder y tú ganas la comisión de referido.',
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
        body: 'Aquí nace lo que la gente compra. Hay tres estantes: lo que tú cargas (personal), los regalos (incentivos) y el catálogo de tu empresa (lo publica administración; tú decides si se ve en tu tienda). El dashboard solo cuenta órdenes ya pagadas.',
      },
      {
        id: 'public',
        target: 'store-public',
        title: 'Ver pública',
        body: 'Este botón abre tu tienda como la ve un cliente, en /s/tu-nombre. Úsalo para comprobar precios, fotos y que el producto se vea. No editas nada ahí: se edita en esta pantalla y luego recargas la pública.',
        optional: true,
      },
      {
        id: 'company',
        target: 'company-scope',
        title: 'Marca del catálogo',
        body: 'Si tienes más de una empresa, elige cuál estás publicando. Añadir empresa suma otra marca al catálogo. La URL de tu tienda sigue siendo la misma.',
        optional: true,
        reveal: 'add-company',
      },
      {
        id: 'sales',
        target: 'store-sales',
        title: 'Las tres tarjetas de dinero',
        body: 'Ventas personales: tú cobraste. Ventas del equipo: alguien de tu red cerró en tu tienda (abre la pestaña Equipo). Total pagado: las dos juntas. Tócalas para filtrar órdenes. Esto no es PV de la empresa.',
        optional: true,
      },
      {
        id: 'tabs',
        target: 'store-tabs',
        title: 'Inventario, Órdenes, Equipo, Ajustes',
        body: 'Inventario: crear, publicar y vender. Órdenes: pedidos y marcar pagado. Equipo: stock que entregaste a un socio. Ajustes: nombre de la tienda, WhatsApp, moneda, margen, pagos (QR, transferencia) y zonas de envío.',
      },
      {
        id: 'shelves',
        target: 'store-shelves',
        title: 'Tres estantes y Registrar venta',
        body: 'Inventario personal (amarillo): tus productos. Incentivos (negro): regalos que ligas a una venta. Catálogo de empresa (verde): publicas o retiras lo de la marca. Registrar venta abre el cobro en persona, con o sin envío, sin pasar por la web del cliente.',
      },
      {
        id: 'create',
        target: 'store-new-product',
        title: 'Crear un producto tuyo',
        body: 'Llena nombre, costo de compra, margen y stock. El precio de venta se calcula solo; si lo cambias a mano, el margen se actualiza. Marca Publicado en la tienda pública para que se vea afuera. Guardar lo deja en tu bodega. Esto no se comparte con otros líderes.',
        reveal: 'personal',
        optional: true,
      },
      {
        id: 'gift',
        target: 'store-gift',
        title: 'Asignar un incentivo',
        body: 'Primero crea el regalo en el estante Incentivos (nombre, costo y stock). Luego, al crear o editar un producto personal, en Incentivo eliges ese regalo y cuántas unidades van por venta. El costo del regalo se suma al costo de venta. Si no hay incentivos, el menú dice Sin incentivo.',
        reveal: 'personal',
        optional: true,
      },
      {
        id: 'warehouse',
        target: 'store-warehouse',
        title: 'Vender, asignar, editar',
        body: 'En cada producto: Vender registra una venta ahora. Asignar entrega unidades a un miembro del equipo (salen de tu bodega). Editar abre el formulario de la izquierda. Eliminar lo quita. El CSV de arriba sirve para cargar muchos de una vez.',
        reveal: 'personal',
        optional: true,
      },
      {
        id: 'incentives',
        target: 'store-new-product',
        title: 'Crear un incentivo',
        body: 'Estás en Incentivos. Un incentivo no se vende solo: es el extra que das. Pones nombre, costo de compra y stock. Guardar. Después lo ligas desde un producto personal, como te mostré. Al vender ese producto, se descuenta el stock del regalo.',
        reveal: 'incentive',
        optional: true,
      },
      {
        id: 'publish',
        target: 'store-company-catalog',
        title: 'Publicar un producto de la empresa',
        body: 'Esto lo carga la marca; tú no lo inventas. Puedes poner precio y moneda locales. Publicar lo muestra en tu e-commerce. Publicado otra vez lo retira. Vender cobra en persona. Si no ves lista, tu cuenta aún no tiene empresa afiliada o el catálogo está vacío.',
        reveal: 'company',
        optional: true,
      },
      {
        id: 'orders',
        target: 'store-orders',
        title: 'Órdenes',
        body: 'Aquí llegan los pedidos de la tienda pública y los que registraste a mano. Marca pagado cuando el cliente ya depositó o pagó QR. Hasta que esté pagado, no suma en el dashboard ni en el cierre.',
        reveal: 'orders',
        optional: true,
      },
      {
        id: 'settings',
        target: 'store-settings',
        title: 'Ajustes de la tienda',
        body: 'Nombre, moneda, WhatsApp, margen objetivo y cómo te pagan (QR, transferencia, depósito). Dropshipping: zonas y tarifas de envío. Guardar aplica a toda la tienda. El margen se puede recalcular sobre tu inventario personal, no sobre incentivos ni empresa.',
        reveal: 'settings',
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
        body: 'Es la carta de presentación: foto, logo, textos y un botón a WhatsApp o a tu tienda. Sirve para captar socios y clientes. Mientras esté en borrador, solo tú la ves aquí.',
      },
      {
        id: 'actions',
        target: 'landing-actions',
        title: 'Vista pública y Publicar',
        body: 'Vista pública abre /l/tu-slug como la ve el mundo (si ya está publicada). Publicar la pone en línea. Despublicar la deja en borrador otra vez: el enlace deja de mostrar la página viva. No borra tu diseño.',
        optional: true,
      },
      {
        id: 'hero',
        target: 'landing-hero',
        title: 'Toca lo que quieres cambiar',
        body: 'En el celular de prueba, toca el logo, tu foto, Cambiar fondo o un texto. Se abre una ventana para subir imagen o editar palabras. Listo cierra. Guardar deja el cambio. No hace falta bajar al panel de la derecha.',
        optional: true,
      },
      {
        id: 'blocks',
        target: 'landing-blocks',
        title: 'Forma, colores y Guardar',
        body: 'Aquí eliges la silueta de tu foto y pegas los colores de tu marca (#e72fb9). Abajo puedes añadir un bloque de texto, imagen o botón a la tienda. Cuando te guste la vista previa, Guardar y luego Publicar arriba.',
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
        body: 'No es la tienda: es material para hablar con un cliente o un socio. Cada tarjeta abre una herramienta. Nada de esto reemplaza una consulta médica.',
      },
      {
        id: 'company',
        target: 'company-scope',
        title: 'De qué empresa son',
        body: 'Los protocolos y productos recomendados salen del catálogo de la marca activa. Si añadiste otra empresa, cámbiala aquí antes de armar una recomendación.',
        optional: true,
      },
      {
        id: 'grid',
        target: 'tools-grid',
        title: 'Qué hace cada tarjeta',
        body: 'Bienestar: elige una dolencia y arma el protocolo. IMC: peso y paquetes. Consulta: cuestionario. Flyers, PDFs, videos y audios: descargas para compartir. WhatsApp: extensión para grupos. Toca Abrir → en la que necesites hoy.',
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
        title: 'No es la venta de la tienda',
        body: 'Ganas un porcentaje cuando un socio que invitaste paga el plan y se vuelve líder. Siempre en dólares. No es bono de producto ni GMV de tu e-commerce. Para cobrar una venta de producto, eso se ve en Tienda → Órdenes.',
      },
      {
        id: 'balance',
        target: 'comm-balance',
        title: 'Solicitar ganancias',
        body: 'Disponible es lo que ya puedes pedir. Pendiente aún no se libera. En solicitud está reservado. El botón amarillo abre el formulario: WhatsApp y tu contraseña. Administración te escribe para el depósito. Hay un mínimo; si no lo alcanzas, el botón queda apagado.',
        optional: true,
      },
      {
        id: 'list',
        target: 'comm-list',
        title: 'El historial',
        body: 'Cada comisión y cada retiro: pendiente, pagada o rechazada. Revisa aquí si ya te depositaron. El WhatsApp de la solicitud es para localizarte, no para cobrar dentro de la app.',
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
        title: 'El reporte de tu mes',
        body: 'Es el cierre de TU red, no el backoffice de la empresa ni el de otros líderes. Ventas de tienda y comisión SaaS van en un plano. El volumen de la marca (PV) va en otro. No se mezclan.',
      },
      {
        id: 'period',
        target: 'close-period',
        title: 'Periodo, Ver y CSV',
        body: 'Elige el mes. Anterior retrocede un mes. Ver recarga los números. CSV descarga el Excel para tu contable. La zona horaria es la de tu país; si no hay, La Paz.',
      },
      {
        id: 'company',
        target: 'close-company',
        title: 'Datos de empresa',
        body: 'El dato oficial lo carga administración (conector). Si tu red aún no está ahí, subes un Excel solo de tu gente. Si no hay PV, no mostramos un 0 fingido. Arriba también puedes cambiar o añadir empresa.',
        optional: true,
      },
      {
        id: 'volume',
        target: 'close-volume',
        title: 'Volumen y metas',
        body: 'Personal y de grupo según la empresa, más rango si existe. Las metas de tienda y de volumen se editan por separado. Nunca se suman con el dinero de las órdenes pagadas.',
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
        body: 'Datos de quién eres en el sistema y cómo se ve el panel. La paleta de colores se guarda en este celular o computadora, no en el servidor.',
      },
      {
        id: 'account',
        target: 'profile-account',
        title: 'Quién eres aquí',
        body: 'Nombre, correo, rol (socio o líder), red y empresa/rango si administración los cargó. Cerrar sesión vale cuando prestas el equipo. No borra tu tienda ni tu red.',
      },
      {
        id: 'look',
        target: 'profile-look',
        title: 'Apariencia',
        body: 'Claro u oscuro y la paleta. Sirve para que el panel se parezca a tu marca. El sol/luna de arriba hace lo mismo, más rápido.',
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
        body: 'Hoy eres socio. Al elegir un plan y pagar (Paddle), naces tu red, tu landing y tu tienda. Tu líder actual gana la comisión de referido. Las ventas de productos siguen cobrándose por QR o transferencia: eso no pasa por Paddle.',
      },
      {
        id: 'plans',
        target: 'plan-grid',
        title: 'Compara e inscríbete',
        body: 'Cada tarjeta es un plan de la plataforma, no un rango de la empresa. Toca una para seleccionarla y confirma abajo. Cuando termines, ve a Equipo e invita a tu primer socio, y a Tienda para publicar o crear productos.',
        optional: true,
      },
    ],
  },
  support: {
    tone: 'ink',
    launcher: '¿Te explico soporte?',
    steps: [
      {
        id: 'welcome',
        target: 'support-welcome',
        title: 'Ayuda de la plataforma',
        body: 'Si algo no carga, no llega un correo o no entiendes un botón, escribe aquí. No es el WhatsApp de un cliente: es el equipo que mantiene REXmlm.',
      },
      {
        id: 'form',
        target: 'support-form',
        title: 'Enviar ticket',
        body: 'Asunto corto (por ejemplo: no llega la invitación) y en el mensaje qué estabas haciendo. Enviar ticket lo deja en cola. Te responden en esta misma pantalla.',
      },
      {
        id: 'list',
        target: 'support-list',
        title: 'Tus tickets',
        body: 'Toca uno para leer la respuesta. Si sigue abierto, puedes añadir más información abajo. Cerrado significa que ya lo atendieron.',
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
  support: 'support',
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
