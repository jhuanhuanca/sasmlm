const storageKey = (slug: string): string => `rexmlm.shop.partner.${slug}`

export function resolveShopPartnerRef(
  slug: string,
  queryRef?: string | null,
  loggedPartnerId?: number | null,
): number | null {
  if (!slug) {
    return loggedPartnerId ?? null
  }

  if (queryRef && /^\d+$/.test(queryRef)) {
    localStorage.setItem(storageKey(slug), queryRef)
    return Number(queryRef)
  }

  if (loggedPartnerId && loggedPartnerId > 0) {
    localStorage.setItem(storageKey(slug), String(loggedPartnerId))
    return loggedPartnerId
  }

  const stored = localStorage.getItem(storageKey(slug))

  if (stored && /^\d+$/.test(stored)) {
    return Number(stored)
  }

  return null
}

export function shopRefQuery(partnerRef: number | null | undefined): Record<string, string> {
  return partnerRef ? { ref: String(partnerRef) } : {}
}
