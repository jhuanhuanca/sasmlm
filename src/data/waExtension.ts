export const WA_STORE_EXTENSION_ID = 'pagpkdoefaimfhoffdcgflomhnjpfiil'

export const WA_STORE_URL = `https://chromewebstore.google.com/detail/${WA_STORE_EXTENSION_ID}`

export const WA_STORE_NAME = 'WhatsApp Group Finder Gratis: Enlaces de Grupo y Extractor de Contactos'

export const WA_STORE_VERSION = '1.0.9'

/** ID estable de extensions/rexmlm-bridge (manifiesto con "key"). */
export const REXMLM_BRIDGE_ID = 'lhdlhbelinhjeabmpbioakjdjbfmfbmj'

export const REXMLM_BRIDGE_NAME = 'REXmlm Bridge'

export function ownWaExtensionId(): string {
  return (import.meta.env.VITE_WA_EXTENSION_ID ?? '').trim() || REXMLM_BRIDGE_ID
}
