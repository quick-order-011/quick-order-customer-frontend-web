import type { ThemeConfig } from '../../types/theme'

interface HeaderProps {
  theme: ThemeConfig
  tableId: string
  cafeName?: string
}

export function Header({ theme, tableId, cafeName }: HeaderProps) {
  const { headerStyle } = theme.layout

  if (headerStyle === 'fullImage' && theme.assets.headerImageUrl) {
    return (
      <header className="relative h-48 overflow-hidden">
        <img
          src={theme.assets.headerImageUrl}
          alt={cafeName ?? theme.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {cafeName ?? theme.name}
          </h1>
          <p className="text-sm opacity-80">Sto #{tableId}</p>
        </div>
      </header>
    )
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 px-5 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {headerStyle === 'branded' && theme.assets.logoUrl && (
        <img
          src={theme.assets.logoUrl}
          alt="Logo"
          className="h-9 w-9 rounded-full object-cover"
          style={{ border: '2px solid var(--border)' }}
        />
      )}
      <h1
        className="flex-1 truncate text-base font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-1)',
          letterSpacing: 'var(--letter-spacing-display)',
        }}
      >
        {cafeName ?? theme.name}
      </h1>
      <span
        className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text-2)',
          border: '1px solid var(--border)',
        }}
      >
        Sto #{tableId}
      </span>
    </header>
  )
}
