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
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-[var(--font-weight-display)] font-[family-name:var(--font-display)]">
            {cafeName ?? theme.name}
          </h1>
          <p className="text-sm opacity-80">Sto #{tableId}</p>
        </div>
      </header>
    )
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
      style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
    >
      {headerStyle === 'branded' && theme.assets.logoUrl && (
        <img
          src={theme.assets.logoUrl}
          alt="Logo"
          className="h-10 w-10 rounded-full object-cover"
        />
      )}
      <div className="flex-1">
        <h1
          className="text-lg leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--font-weight-display)',
            color: 'var(--text-1)',
          }}
        >
          {cafeName ?? theme.name}
        </h1>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-medium"
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
