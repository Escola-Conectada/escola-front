export const BRAZIL_PHONE_COUNTRY_CODE = '55'
export const BRAZIL_PHONE_LOCAL_DIGITS = 11
export const BRAZIL_PHONE_MASK_MAX_LENGTH = 19
export const BRAZIL_PHONE_PLACEHOLDER = '+55 (11) 99999-9999'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function getBrazilPhoneLocalDigits(value: string) {
  const digits = onlyDigits(value)
  const localDigits = digits.startsWith(BRAZIL_PHONE_COUNTRY_CODE) && digits.length > BRAZIL_PHONE_LOCAL_DIGITS
    ? digits.slice(BRAZIL_PHONE_COUNTRY_CODE.length)
    : digits

  return localDigits.slice(0, BRAZIL_PHONE_LOCAL_DIGITS)
}

export function formatBrazilPhone(value: string) {
  const digits = getBrazilPhoneLocalDigits(value)

  if (!digits) {
    return ''
  }

  const ddd = digits.slice(0, 2)
  const firstPart = digits.slice(2, 7)
  const lastPart = digits.slice(7, 11)
  let formatted = '+55'

  if (ddd) {
    formatted += ` (${ddd}`
  }

  if (ddd.length === 2) {
    formatted += ')'
  }

  if (firstPart) {
    formatted += ` ${firstPart}`
  }

  if (lastPart) {
    formatted += `-${lastPart}`
  }

  return formatted
}

export function isCompleteBrazilPhone(value: string) {
  return getBrazilPhoneLocalDigits(value).length === BRAZIL_PHONE_LOCAL_DIGITS
}

export function normalizeBrazilPhoneForApi(value: string) {
  const digits = getBrazilPhoneLocalDigits(value)

  return digits ? `+${BRAZIL_PHONE_COUNTRY_CODE}${digits}` : ''
}
