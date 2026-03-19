export interface ThemeConfig {
  cafeId: string
  name: string
  preset?: 'warm' | 'modern' | 'minimal' | 'luxury'

  colors: {
    background: string
    surface: string
    surfaceHover: string
    primary: string
    primaryText: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    border: string
    cartBar: string
    cartBarText: string
    success: string
    error: string
  }

  typography: {
    fontDisplay: string
    fontBody: string
    fontSizeBase: string
    fontWeightDisplay: number
    fontWeightBody: number
    letterSpacingDisplay: string
  }

  shape: {
    borderRadius: string
    cardShadow: string
    imageBorderRadius: string
  }

  layout: {
    headerStyle: 'minimal' | 'branded' | 'fullImage'
    gridColumns: 1 | 2
    showItemDescription: boolean
    showCategoryIcons: boolean
  }

  assets: {
    logoUrl?: string
    headerImageUrl?: string
    placeholderImageUrl?: string
    faviconUrl?: string
  }
}
