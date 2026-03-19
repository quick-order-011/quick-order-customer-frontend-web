import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { injectTheme } from '../../lib/injectTheme'
import type { ThemeConfig } from '../../types/theme'
import { mockUpdateTheme } from '../../mocks/handlers'
import { PresetSelector } from './PresetSelector'
import { ColorField } from './ColorField'
import { FontSelector } from './FontSelector'

export function ThemeEditor() {
  const { cafeId = '' } = useParams()
  const { data: savedTheme, isLoading } = useTheme(cafeId)
  const [overrides, setOverrides] = useState<Partial<ThemeConfig> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Merge saved theme with local overrides
  const theme: ThemeConfig | null = useMemo(
    () => savedTheme ? { ...savedTheme, ...overrides } : null,
    [savedTheme, overrides],
  )

  useEffect(() => {
    if (theme) injectTheme(theme)
  }, [theme])

  if (isLoading || !theme) {
    return <div className="flex min-h-screen items-center justify-center">Učitavanje...</div>
  }

  const updateColors = (key: keyof ThemeConfig['colors'], value: string) => {
    if (!theme) return
    setOverrides(o => ({ ...o, colors: { ...theme.colors, ...o?.colors, [key]: value } }))
    setSaved(false)
  }

  const updateTypography = (key: keyof ThemeConfig['typography'], value: string | number) => {
    if (!theme) return
    setOverrides(o => ({ ...o, typography: { ...theme.typography, ...o?.typography, [key]: value } }))
    setSaved(false)
  }

  const updateShape = (key: keyof ThemeConfig['shape'], value: string) => {
    if (!theme) return
    setOverrides(o => ({ ...o, shape: { ...theme.shape, ...o?.shape, [key]: value } }))
    setSaved(false)
  }

  const updateLayout = (key: keyof ThemeConfig['layout'], value: ThemeConfig['layout'][keyof ThemeConfig['layout']]) => {
    if (!theme) return
    setOverrides(o => ({ ...o, layout: { ...theme.layout, ...o?.layout, [key]: value } }))
    setSaved(false)
  }

  const applyPreset = (preset: Partial<ThemeConfig>) => {
    setOverrides(o => ({ ...o, ...preset }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!theme) return
    setSaving(true)
    await mockUpdateTheme(cafeId, theme)
    setSaving(false)
    setSaved(true)
  }

  const colorFields: { key: keyof ThemeConfig['colors']; label: string }[] = [
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Surface (kartice)' },
    { key: 'surfaceHover', label: 'Surface hover' },
    { key: 'primary', label: 'Primary (CTA)' },
    { key: 'primaryText', label: 'Primary text' },
    { key: 'textPrimary', label: 'Text primary' },
    { key: 'textSecondary', label: 'Text secondary' },
    { key: 'textMuted', label: 'Text muted' },
    { key: 'border', label: 'Border' },
    { key: 'cartBar', label: 'Cart bar' },
    { key: 'cartBarText', label: 'Cart bar text' },
    { key: 'success', label: 'Success' },
    { key: 'error', label: 'Error' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Theme Editor</h1>
      <p className="mb-6 text-sm text-gray-500">Kafić: {cafeId}</p>

      <div className="space-y-8">
        {/* Presets */}
        <PresetSelector onSelect={applyPreset} />

        {/* Colors */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Boje</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {colorFields.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={theme.colors[key]}
                onChange={v => updateColors(key, v)}
              />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Tipografija</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FontSelector
              label="Display font"
              value={theme.typography.fontDisplay}
              onChange={v => updateTypography('fontDisplay', v)}
            />
            <FontSelector
              label="Body font"
              value={theme.typography.fontBody}
              onChange={v => updateTypography('fontBody', v)}
            />
          </div>
        </section>

        {/* Shape */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Oblik</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Border radius: {theme.shape.borderRadius}
              </label>
              <input
                type="range"
                min={0}
                max={24}
                value={parseInt(theme.shape.borderRadius)}
                onChange={e => updateShape('borderRadius', `${e.target.value}px`)}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Card shadow</label>
              <select
                value={
                  theme.shape.cardShadow === 'none'
                    ? 'none'
                    : theme.shape.cardShadow.includes('20px')
                      ? 'heavy'
                      : 'light'
                }
                onChange={e => {
                  const map: Record<string, string> = {
                    none: 'none',
                    light: '0 1px 3px rgba(0,0,0,0.08)',
                    heavy: '0 4px 20px rgba(0,0,0,0.4)',
                  }
                  updateShape('cardShadow', map[e.target.value])
                }}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Layout</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Header stil</label>
              <select
                value={theme.layout.headerStyle}
                onChange={e =>
                  updateLayout('headerStyle', e.target.value as ThemeConfig['layout']['headerStyle'])
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="minimal">Minimal</option>
                <option value="branded">Branded</option>
                <option value="fullImage">Full Image</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Grid kolone</label>
              <select
                value={theme.layout.gridColumns}
                onChange={e =>
                  updateLayout('gridColumns', Number(e.target.value) as 1 | 2)
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value={1}>1 kolona</option>
                <option value={2}>2 kolone</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Čuvam...' : saved ? 'Sačuvano!' : 'Sačuvaj temu'}
        </button>
      </div>
    </div>
  )
}
