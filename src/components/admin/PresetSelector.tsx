import { presets } from '../../lib/presets'
import type { ThemeConfig } from '../../types/theme'

const PRESET_INFO: Record<string, { label: string; description: string }> = {
  warm: { label: 'Warm', description: 'Toplo, espresso, tamno' },
  modern: { label: 'Modern', description: 'Čisto, minimalno, svetlo' },
  minimal: { label: 'Minimal', description: 'Ultra-clean, puno white space' },
  luxury: { label: 'Luxury', description: 'Premium, zlatni akcenti' },
}

interface PresetSelectorProps {
  onSelect: (preset: Partial<ThemeConfig>) => void
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Preset</label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(presets).map(([key, preset]) => {
          const info = PRESET_INFO[key]
          return (
            <button
              key={key}
              onClick={() => onSelect(preset)}
              className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-gray-400"
            >
              <div className="mb-1 flex gap-1">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: preset.colors.background }}
                />
              </div>
              <p className="text-sm font-semibold">{info.label}</p>
              <p className="text-xs text-gray-500">{info.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
