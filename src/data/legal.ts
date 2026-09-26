export type LegalSlug = 'terminos' | 'privacidad' | 'reembolsos' | 'uso-aceptable' | 'cookies'

export type LegalSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type LegalDoc = {
  slug: LegalSlug
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

export const legalContact = {
  email: 'hola@rexmlm.tech',
  site: 'https://rexmlm.tech',
  merchant: 'Paddle.com Market Ltd (y afiliadas, “Paddle”)',
}

export const legalNav: Array<{ slug: LegalSlug; title: string }> = [
  { slug: 'terminos', title: 'Términos de servicio' },
  { slug: 'privacidad', title: 'Política de privacidad' },
  { slug: 'reembolsos', title: 'Reembolsos y cancelación' },
  { slug: 'uso-aceptable', title: 'Uso aceptable' },
  { slug: 'cookies', title: 'Cookies' },
]

export const legalDocs: Record<LegalSlug, LegalDoc> = {
  terminos: {
    slug: 'terminos',
    title: 'Términos de servicio',
    updated: '21 de septiembre de 2026',
    intro:
      'Estos términos regulan el uso del software REXmlm (catálogo, tienda en línea, página pública, gestión de equipo y facturación) en rexmlm.tech. Al crear una cuenta o pagar un plan aceptas este documento, la política de privacidad, la de reembolsos y la de uso aceptable.',
    sections: [
      {
        title: '1. Quiénes somos y qué vendemos',
        paragraphs: [
          'REXmlm es un software como servicio (SaaS). Vendemos acceso a una plataforma digital de operación comercial: inventario y pedidos, página web, invitaciones a colaboradores, reportes y soporte. No vendemos bienes físicos, listas de contactos, minutos de llamada ni campañas de mensajería masiva.',
          `Los cobros de los planes de plataforma los procesa ${legalContact.merchant} como comerciante registrado (Merchant of Record). Paddle aparece en el extracto de la tarjeta, emite la factura fiscal del software y gestiona impuestos aplicables. REXmlm presta el servicio técnico; Paddle formaliza la venta del plan.`,
        ],
      },
      {
        title: '2. Cuentas',
        paragraphs: [
          'Debes tener al menos 18 años y datos verdaderos. Eres responsable de la confidencialidad de tu acceso y de la actividad de quienes invites a tu espacio.',
          'Podemos suspender cuentas por impago, abuso, fraude o incumplimiento de estos términos o de la política de uso aceptable.',
        ],
      },
      {
        title: '3. Planes y cobro',
        paragraphs: [
          'Los planes Básico, Intermedio y Premium se publican en el sitio con precio de lista en USD. El primer ciclo de un plan nuevo puede facturarse a US$ 1; los ciclos siguientes cobran el precio de lista mientras la suscripción esté activa. Un colaborador invitado no paga el plan de la plataforma.',
          'La marca o catálogo adicional, si aplica, es un recargo recurrente aparte. Los precios pueden incluir impuestos según el país del comprador, calculados por Paddle en el checkout.',
          'Al pagar aceptas también los términos de comprador de Paddle: https://www.paddle.com/legal/checkout-buyer-terms',
        ],
      },
      {
        title: '4. Programa de afiliados (opcional)',
        paragraphs: [
          'Si recomiendas REXmlm a alguien que se suscribe por su cuenta y paga el precio de lista, podemos acreditarte una comisión única del 10 % sobre ese primer cobro de lista (no sobre el ciclo de US$ 1 ni sobre recargos de catálogo extra). No es un esquema multinivel: no se pagan niveles, no hay inventario obligatorio y no se exige reclutar personas para “ganar”.',
          'Está prohibido promover el software con spam, llamadas no solicitadas o mensajes masivos. El incumplimiento anula comisiones y puede cerrar la cuenta.',
        ],
      },
      {
        title: '5. Propiedad intelectual',
        paragraphs: [
          'El software, la marca REXmlm y los contenidos propios nos pertenecen o están licenciados. Tú conservas los datos que subas (productos, textos, imágenes, nombre comercial y rango). Nos concedes una licencia limitada para alojarlos y mostrarlos mientras uses el servicio.',
          'Eres responsable de no usar marcas, logotipos ni materiales de terceros sin autorización. REXmlm no es socio, filial ni representante de otras empresas.',
        ],
      },
      {
        title: '6. Disponibilidad y límites',
        paragraphs: [
          'El servicio se ofrece “tal cual”. Procuramos continuidad razonable, copias de seguridad y corrección de fallos, sin garantizar un SLA específico salvo pacto escrito.',
          'No respondemos por pérdidas indirectas, lucro cesante ni decisiones comerciales que tomes con la información del panel. La responsabilidad máxima agregada, en la medida que permita la ley, se limita a lo pagado a Paddle por el plan en los tres meses anteriores al reclamo.',
        ],
      },
      {
        title: '7. Ley aplicable',
        paragraphs: [
          'Estos términos se interpretan de forma compatible con la normativa de consumo del país del comprador cuando esta sea imperativa. Las disputas de cobro del plan pueden gestionarse también a través del soporte de Paddle.',
          `Notificaciones: ${legalContact.email}`,
        ],
      },
    ],
  },
  privacidad: {
    slug: 'privacidad',
    title: 'Política de privacidad',
    updated: '21 de septiembre de 2026',
    intro:
      'Explica qué datos personales tratamos, para qué y con quién. El responsable del tratamiento de la cuenta y del panel es el operador de REXmlm. Paddle es responsable independiente de los datos de pago del checkout.',
    sections: [
      {
        title: '1. Datos que recabamos',
        paragraphs: ['Según el uso del sitio podemos tratar:'],
        bullets: [
          'Identificación y contacto: nombre, correo, país, teléfono si lo facilitas.',
          'Cuenta: empresa o catálogo que eliges, rol, registros de acceso.',
          'Operación: inventario, pedidos, páginas, invitaciones y tickets de soporte.',
          'Pago: Paddle recibe tarjeta o método de pago; REXmlm no almacena el número completo de tarjeta.',
          'Técnicos: IP, tipo de navegador, páginas visitadas y cookies necesarias (ver política de cookies).',
          'Formulario de contacto: el mensaje que nos envías de forma voluntaria.',
        ],
      },
      {
        title: '2. Finalidades y base',
        paragraphs: ['Usamos los datos para:'],
        bullets: [
          'Prestar el SaaS, autenticarte y dar soporte (ejecución del contrato).',
          'Cobrar el plan a través de Paddle (contrato e obligación fiscal de Paddle).',
          'Seguridad, prevención de fraude y cumplimiento legal (interés legítimo u obligación legal).',
          'Responder consultas del formulario solo si nos escribes (consentimiento o medidas precontractuales).',
        ],
      },
      {
        title: '3. Lo que no hacemos',
        paragraphs: [
          'No vendemos bases de datos. No compramos ni revendemos listas de correos o teléfonos. No usamos REXmlm para enviar marketing masivo no solicitado a terceros. El software no está pensado para llamadas en frío, scraping de contactos ni difusión no consentida por WhatsApp, SMS o correo.',
        ],
      },
      {
        title: '4. Encargados y destinatarios',
        paragraphs: [
          `Alojamiento y correo transaccional (alta, restablecer clave, avisos de cuenta). Pagos: ${legalContact.merchant}. Autenticación opcional con Google si eliges “Continuar con Google”.`,
          'Solo compartimos lo necesario para operar el servicio, cumplir la ley o atender un incidente de seguridad.',
        ],
      },
      {
        title: '5. Conservación',
        paragraphs: [
          'La cuenta y los datos de operación se conservan mientras el espacio esté activo y el tiempo extra que exija facturación, fraude o ley. Los pagos los conserva Paddle según su propia política: https://www.paddle.com/legal/privacy',
        ],
      },
      {
        title: '6. Derechos',
        paragraphs: [
          `Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad, y retirar un consentimiento, en ${legalContact.email}. Si estás en el EEE o Reino Unido también puedes acudir a tu autoridad de protección de datos.`,
          'No usamos decisiones automatizadas que produzcan efectos jurídicos sobre ti al margen de la prevención de fraude del pago (a cargo de Paddle).',
        ],
      },
    ],
  },
  reembolsos: {
    slug: 'reembolsos',
    title: 'Reembolsos y cancelación',
    updated: '21 de septiembre de 2026',
    intro:
      'Política de la suscripción de software REXmlm cobrada por Paddle. El comprador también tiene los derechos que le reconozca la ley de su país y los términos de comprador de Paddle.',
    sections: [
      {
        title: '1. Cómo cancelar',
        paragraphs: [
          'En el panel (Ajustes) puedes programar la cancelación al final del periodo ya pagado. Seguirás usando el software hasta esa fecha. No hay permanencia forzosa más allá del ciclo en curso.',
        ],
      },
      {
        title: '2. Reembolso de 14 días (primer cobro de un plan)',
        paragraphs: [
          'Si es la primera vez que pagas un plan de plataforma y pides la devolución dentro de los 14 días naturales desde ese cobro, reembolsaremos ese cargo (el de US$ 1 o el de lista, el que haya sido) siempre que no exista abuso evidente (fraude, uso extremo de recursos o reembolsos repetidos).',
          'El reembolso lo ejecuta Paddle sobre el mismo método de pago. Puede tardar en verse en el extracto según tu banco.',
        ],
      },
      {
        title: '3. Renovaciones posteriores',
        paragraphs: [
          'Los ciclos siguientes (precio de lista) no son reembolsables de forma prorrateada, salvo que la ley de consumo aplicable lo exija o Paddle determine lo contrario. Cancela antes de la fecha de renovación para no generar el siguiente cargo.',
        ],
      },
      {
        title: '4. Recargos de catálogo extra',
        paragraphs: [
          'Los add-ons recurrentes de catálogo o marca adicional siguen la misma lógica: 14 días en el primer cobro de ese add-on; renovaciones no prorrateadas salvo ley imperativa.',
        ],
      },
      {
        title: '5. Cómo solicitarlo',
        paragraphs: [
          `Escribe a ${legalContact.email} o usa el soporte de Paddle desde el correo de compra. Indica el correo de la cuenta y, si lo tienes, el ID de transacción.`,
        ],
      },
    ],
  },
  'uso-aceptable': {
    slug: 'uso-aceptable',
    title: 'Política de uso aceptable',
    updated: '21 de septiembre de 2026',
    intro:
      'El software se licencia para operar un negocio lícito (tienda, página, equipo y reportes). Esta política existe para proteger a compradores, a Paddle y a REXmlm. El incumplimiento permite suspender el servicio sin reembolso del ciclo en curso, además de anular comisiones de afiliado.',
    sections: [
      {
        title: '1. Usos permitidos',
        paragraphs: [
          'Gestionar catálogo e inventario propios, publicar una página o tienda a la que las personas llegan por su voluntad, invitar colaboradores que aceptan unirse, y llevar el seguimiento interno de tu operación.',
        ],
      },
      {
        title: '2. Marketing saliente no solicitado (prohibido)',
        paragraphs: ['Queda prohibido usar REXmlm, o promover REXmlm, para:'],
        bullets: [
          'Llamadas, SMS, WhatsApp, Telegram u otras apps de mensajería a personas que no pidieron ser contactadas (telemarketing o “frío”).',
          'Correo masivo o scraping de direcciones, teléfonos o perfiles.',
          'Comprar o alquilar bases de datos para bombardear ofertas.',
          'Automatizar envíos no consentidos o fingir identidad.',
        ],
      },
      {
        title: '3. Otros usos prohibidos',
        paragraphs: ['También está prohibido:'],
        bullets: [
          'Fraude, phishing, malware o eludir el cobro.',
          'Vender productos ilegales, peligrosos o que violen derechos de terceros.',
          'Presentar REXmlm como un esquema piramidal, “hazte rico”, o como red que paga por reclutar personas en cadena.',
          'Infringir marcas de terceros o afirmar una relación oficial que no existe.',
          'Sobrecargar la plataforma o atacar su seguridad.',
        ],
      },
      {
        title: '4. Consentimiento',
        paragraphs: [
          'Si contactas a alguien desde tu actividad, debes tener una base legal (por ejemplo, que te escribió, es cliente o dio opt-in claro) y un medio real de baja. REXmlm no sustituye tu cumplimiento de GDPR, CAN-SPAM, leyes de llamadas no solicitadas u homologas locales.',
        ],
      },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Política de cookies',
    updated: '21 de septiembre de 2026',
    intro:
      'rexmlm.tech usa pocas cookies, las mínimas para que el sitio y el panel funcionen. No vendemos perfiles publicitarios de terceros en la web de marketing.',
    sections: [
      {
        title: '1. Necesarias',
        paragraphs: [
          'Sesión y autenticación (para mantenerte conectado), preferencia de apariencia (claro/oscuro) en este dispositivo, y seguridad (CSRF o equivalentes). Sin ellas el panel no opera.',
        ],
      },
      {
        title: '2. Pago',
        paragraphs: [
          'En el checkout, Paddle puede fijar cookies propias según su política, necesarias para el pago y la prevención de fraude.',
        ],
      },
      {
        title: '3. Cómo gestionarlas',
        paragraphs: [
          'Puedes bloquear cookies en el navegador. Si bloqueas las necesarias, es posible que no puedas iniciar sesión. No usamos un muro de cookies de marketing de terceros en la home.',
        ],
      },
    ],
  },
}
