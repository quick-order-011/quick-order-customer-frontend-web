import type { ThemeConfig } from '../types/theme'

export function injectTheme(theme: ThemeConfig) {
  const { colors, typography, shape } = theme

  // Google Fonts dynamic load
  const fontsToLoad = [typography.fontDisplay, typography.fontBody]
    .filter(Boolean)
    .map(f => f.replace(/ /g, '+'))
    .join('&family=')

  let fontLink = document.getElementById('qo-fonts') as HTMLLinkElement
  if (!fontLink) {
    fontLink = document.createElement('link')
    fontLink.id = 'qo-fonts'
    fontLink.rel = 'stylesheet'
    document.head.appendChild(fontLink)
  }
  fontLink.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad}:wght@400;600;700&display=swap`

  // CSS vars injection
  const vars = `
    :root {
      --bg: ${colors.background};
      --surface: ${colors.surface};
      --surface-hover: ${colors.surfaceHover};
      --primary: ${colors.primary};
      --primary-text: ${colors.primaryText};
      --text-1: ${colors.textPrimary};
      --text-2: ${colors.textSecondary};
      --text-muted: ${colors.textMuted};
      --border: ${colors.border};
      --cart-bar: ${colors.cartBar};
      --cart-bar-text: ${colors.cartBarText};
      --success: ${colors.success};
      --error: ${colors.error};
      --radius: ${shape.borderRadius};
      --radius-img: ${shape.imageBorderRadius};
      --shadow: ${shape.cardShadow};
      --font-display: '${typography.fontDisplay}', serif;
      --font-body: '${typography.fontBody}', sans-serif;
      --font-size-base: ${typography.fontSizeBase};
      --font-weight-display: ${typography.fontWeightDisplay};
      --font-weight-body: ${typography.fontWeightBody};
      --letter-spacing-display: ${typography.letterSpacingDisplay};
    }
  `

  let styleEl = document.getElementById('qo-theme') as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'qo-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = vars
}
