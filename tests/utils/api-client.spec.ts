import { describe, expect, it, vi } from 'vitest'
import { buildHeaders, createApiClient, normalizeApiError, resolveApiBase } from '~/utils/api-client'

describe('api-client', () => {
  it('adds the JWT bearer token when present', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)

    const api = createApiClient({
      baseURL: 'http://localhost:5001/api',
      getToken: () => 'token-123'
    })

    await api('/usuarios')

    const options = fetchMock.mock.calls[0][1] as { baseURL: string, headers: Headers }
    expect(options.baseURL).toBe('http://localhost:5001/api')
    expect(options.headers.get('Authorization')).toBe('Bearer token-123')
  })

  it('keeps existing headers while adding authorization', () => {
    const headers = buildHeaders({ 'Content-Type': 'application/json' }, 'abc')

    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer abc')
  })

  it('does not keep a localhost API URL when rendered on a public host', () => {
    expect(resolveApiBase('http://localhost:5001/api', 'escola-conectada.vercel.app')).toBe('/api')
    expect(resolveApiBase('http://localhost:5001/api', 'localhost')).toBe('http://localhost:5001/api')
    expect(resolveApiBase('', 'escola-conectada.vercel.app')).toBe('/api')
  })

  it('adds the API prefix to absolute public backend URLs', () => {
    expect(resolveApiBase('https://escola-api-yrns.onrender.com', 'escola-high-conectada.vercel.app'))
      .toBe('https://escola-api-yrns.onrender.com/api')
    expect(resolveApiBase('https://escola-api-yrns.onrender.com/api', 'escola-high-conectada.vercel.app'))
      .toBe('https://escola-api-yrns.onrender.com/api')
  })

  it('calls the unauthorized handler on 401 responses', async () => {
    const onUnauthorized = vi.fn()
    const fetchMock = vi.fn().mockRejectedValue({ response: { status: 401 } })
    vi.stubGlobal('$fetch', fetchMock)

    const api = createApiClient({
      baseURL: 'http://localhost:5001/api',
      getToken: () => null,
      onUnauthorized
    })

    await expect(api('/auth/me')).rejects.toEqual({ response: { status: 401 } })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('notifies the request lifecycle on successful requests', async () => {
    const onRequestStart = vi.fn()
    const onRequestEnd = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)

    const api = createApiClient({
      baseURL: 'http://localhost:5001/api',
      getToken: () => null,
      onRequestStart,
      onRequestEnd
    })

    await api('/usuarios')

    expect(onRequestStart).toHaveBeenCalledTimes(1)
    expect(onRequestEnd).toHaveBeenCalledTimes(1)
    expect(onRequestEnd.mock.invocationCallOrder[0]).toBeGreaterThan(onRequestStart.mock.invocationCallOrder[0])
  })

  it('finishes the request lifecycle when the API rejects', async () => {
    const onRequestStart = vi.fn()
    const onRequestEnd = vi.fn()
    const error = { message: 'Falha ao salvar' }
    const fetchMock = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('$fetch', fetchMock)

    const api = createApiClient({
      baseURL: 'http://localhost:5001/api',
      getToken: () => null,
      onRequestStart,
      onRequestEnd
    })

    await expect(api('/usuarios')).rejects.toEqual(error)

    expect(onRequestStart).toHaveBeenCalledTimes(1)
    expect(onRequestEnd).toHaveBeenCalledTimes(1)
  })

  it('normalizes validation errors returned by the API', () => {
    const message = normalizeApiError({
      response: {
        _data: {
          errors: {
            email: ['Informe um email valido.'],
            senha: ['A senha e obrigatoria.']
          }
        }
      }
    })

    expect(message).toBe('Informe um email valido. A senha e obrigatoria.')
  })

  it('normalizes localhost network errors with deployment guidance', () => {
    const message = normalizeApiError(
      {
        request: 'http://localhost:5001/api/auth/login',
        message: '[POST] "http://localhost:5001/api/auth/login": <no response> Failed to fetch'
      },
      'escola-conectada.vercel.app'
    )

    expect(message).toContain('NUXT_PUBLIC_API_BASE')
    expect(message).toContain('URL publica do backend')
  })

  it('normalizes localhost network errors with local guidance while running locally', () => {
    const message = normalizeApiError(
      {
        request: 'http://localhost:5001/api/auth/login',
        message: '[POST] "http://localhost:5001/api/auth/login": <no response> Failed to fetch'
      },
      'localhost'
    )

    expect(message).toContain('API local')
    expect(message).toContain('http://localhost:5001/api')
  })
})
