interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded border-none"
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-0.5 block w-full rounded border border-gray-300 px-2 py-1 text-xs font-mono"
        />
      </div>
    </div>
  )
}
