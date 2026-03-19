const FONT_OPTIONS = [
  'Inter',
  'DM Sans',
  'Space Mono',
  'Playfair Display',
  'DM Serif Display',
  'Cormorant Garamond',
  'Poppins',
  'Roboto',
  'Lora',
  'Montserrat',
]

interface FontSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
      >
        {FONT_OPTIONS.map(font => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>
  )
}
