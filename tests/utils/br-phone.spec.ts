import { describe, expect, it } from 'vitest'
import {
  formatBrazilPhone,
  getBrazilPhoneLocalDigits,
  isCompleteBrazilPhone,
  normalizeBrazilPhoneForApi
} from '~/utils/br-phone'

describe('br-phone', () => {
  it('formats a local Brazilian mobile number with fixed country code', () => {
    expect(formatBrazilPhone('11999999999')).toBe('+55 (11) 99999-9999')
  })

  it('formats API values without duplicating the country code', () => {
    expect(formatBrazilPhone('+5511999999999')).toBe('+55 (11) 99999-9999')
  })

  it('keeps DDD 55 when the value has no explicit country code', () => {
    expect(getBrazilPhoneLocalDigits('55999999999')).toBe('55999999999')
  })

  it('normalizes the masked value for API payloads', () => {
    expect(normalizeBrazilPhoneForApi('+55 (11) 99999-9999')).toBe('+5511999999999')
  })

  it('identifies incomplete phone values', () => {
    expect(isCompleteBrazilPhone('+55 (11) 9999')).toBe(false)
    expect(isCompleteBrazilPhone('+55 (11) 99999-9999')).toBe(true)
  })
})
