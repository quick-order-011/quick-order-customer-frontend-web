// Dependency-free browser fingerprint used as the guest `x-visitor-id`.
// Collects a rich set of device/browser signals (screen, UA, WebGL, …), derives
// a stable visitor id from the non-volatile subset, and persists it so it
// survives reloads. The full component set is exposed for sending/inspection.

const STORAGE_KEY = 'qo_visitor_id'

// Stable FNV-1a 32-bit hash -> 8-char hex.
function hash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

type NavExtra = Navigator & {
  deviceMemory?: number
  userAgentData?: {
    brands?: { brand: string; version: string }[]
    mobile?: boolean
    platform?: string
  }
  connection?: { effectiveType?: string; downlink?: number; rtt?: number }
  pdfViewerEnabled?: boolean
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

function canvasHash(): string {
  return safe(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 60
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-2d'
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('quick-order:fp🍕', 2, 15)
    ctx.strokeStyle = 'rgba(120,186,176,0.5)'
    ctx.arc(50, 30, 20, 0, Math.PI * 2)
    ctx.stroke()
    return hash(canvas.toDataURL())
  }, 'canvas-blocked')
}

function webgl(): { vendor: string; renderer: string } {
  return safe(
    () => {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      if (!gl) return { vendor: 'no-webgl', renderer: 'no-webgl' }
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      return {
        vendor: dbg
          ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL))
          : String(gl.getParameter(gl.VENDOR)),
        renderer: dbg
          ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
          : String(gl.getParameter(gl.RENDERER)),
      }
    },
    { vendor: 'webgl-error', renderer: 'webgl-error' },
  )
}

function storageSupport() {
  return {
    localStorage: safe(() => Boolean(window.localStorage), false),
    sessionStorage: safe(() => Boolean(window.sessionStorage), false),
    indexedDB: safe(() => Boolean(window.indexedDB), false),
  }
}

export interface FingerprintComponents {
  userAgent: string
  uaData?: { brands?: { brand: string; version: string }[]; mobile?: boolean; platform?: string }
  language: string
  languages: string[]
  platform: string
  vendor: string
  hardwareConcurrency: number | null
  deviceMemory: number | null
  maxTouchPoints: number
  cookieEnabled: boolean
  doNotTrack: string | null
  pdfViewerEnabled: boolean | null
  webdriver: boolean | null
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelDepth: number
    orientation: string | null
  }
  devicePixelRatio: number
  viewport: { innerWidth: number; innerHeight: number; outerWidth: number; outerHeight: number }
  timezone: string
  timezoneOffset: number
  locale: string
  canvasHash: string
  webgl: { vendor: string; renderer: string }
  connection: { effectiveType?: string; downlink?: number; rtt?: number } | null
  storage: { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean }
}

/** Collects the full set of fingerprint signals from the current browser. */
export function collectComponents(): FingerprintComponents {
  const nav = navigator as NavExtra
  const scr = window.screen
  return {
    userAgent: nav.userAgent,
    uaData: nav.userAgentData
      ? {
          brands: nav.userAgentData.brands,
          mobile: nav.userAgentData.mobile,
          platform: nav.userAgentData.platform,
        }
      : undefined,
    language: nav.language,
    languages: Array.from(nav.languages ?? []),
    platform: nav.platform,
    vendor: nav.vendor,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack ?? null,
    pdfViewerEnabled: nav.pdfViewerEnabled ?? null,
    webdriver: nav.webdriver ?? null,
    screen: {
      width: scr.width,
      height: scr.height,
      availWidth: scr.availWidth,
      availHeight: scr.availHeight,
      colorDepth: scr.colorDepth,
      pixelDepth: scr.pixelDepth,
      orientation: safe(() => scr.orientation?.type ?? null, null),
    },
    devicePixelRatio: window.devicePixelRatio,
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
    },
    timezone: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, ''),
    timezoneOffset: new Date().getTimezoneOffset(),
    locale: safe(() => Intl.DateTimeFormat().resolvedOptions().locale, ''),
    canvasHash: canvasHash(),
    webgl: webgl(),
    connection: nav.connection
      ? {
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
        }
      : null,
    storage: storageSupport(),
  }
}

// Stable subset — excludes volatile signals (viewport size, orientation,
// connection, dpr) so the derived id stays constant across resizes/rotations.
function stableSignature(c: FingerprintComponents): string {
  return [
    c.userAgent,
    c.platform,
    c.vendor,
    c.language,
    c.languages.join(','),
    c.hardwareConcurrency,
    c.deviceMemory,
    c.maxTouchPoints,
    `${c.screen.width}x${c.screen.height}x${c.screen.colorDepth}`,
    c.timezone,
    c.timezoneOffset,
    c.canvasHash,
    c.webgl.vendor,
    c.webgl.renderer,
  ].join('|')
}

export interface Fingerprint {
  visitorId: string
  components: FingerprintComponents
  collectedAt: string
}

let cached: Fingerprint | null = null

/** Full fingerprint: stable visitor id + all collected components. */
export function getFingerprint(): Fingerprint {
  if (cached) return cached

  const components = collectComponents()

  let visitorId = ''
  try {
    visitorId = localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    /* localStorage unavailable */
  }
  if (!visitorId) {
    visitorId = `v_${hash(stableSignature(components))}`
    try {
      localStorage.setItem(STORAGE_KEY, visitorId)
    } catch {
      /* ignore persistence failures */
    }
  }

  cached = { visitorId, components, collectedAt: new Date().toISOString() }
  return cached
}

/** Stable visitor id for this browser (used as `x-visitor-id`). */
export function getVisitorId(): string {
  return getFingerprint().visitorId
}
