import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { resetPassword } from '../lib/api'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128

type Status = 'idle' | 'submitting' | 'success'

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  // Backend (GET /auth/reset-password?token=...) validates the token first and
  // redirects here with ?status=verified|already-used|expired|invalid
  // (&token=... only when verified).
  const linkStatus = params.get('status')
  const linkInvalid = !token || (linkStatus !== null && linkStatus !== 'verified')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const validationError = useMemo(() => {
    if (!password) return null
    if (/\s/.test(password)) return 'Lozinka ne sme da sadrži razmake.'
    if (password.length < MIN_PASSWORD_LENGTH)
      return `Lozinka mora imati najmanje ${MIN_PASSWORD_LENGTH} karaktera.`
    if (password.length > MAX_PASSWORD_LENGTH)
      return `Lozinka može imati najviše ${MAX_PASSWORD_LENGTH} karaktera.`
    if (confirm && password !== confirm) return 'Lozinke se ne poklapaju.'
    return null
  }, [password, confirm])

  const canSubmit =
    !!token &&
    !!password &&
    !!confirm &&
    !validationError &&
    status !== 'submitting'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setStatus('submitting')
    try {
      await resetPassword(token, password, confirm)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške.')
      setStatus('idle')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6">
          <span className="text-sm font-semibold tracking-wide text-orange-600">
            QuickOrder
          </span>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Nova lozinka
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Unesi novu lozinku za svoj nalog.
          </p>
        </div>

        {linkInvalid ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {linkStatus === 'expired'
              ? 'Link je istekao. Zatraži novi link za reset lozinke.'
              : linkStatus === 'already-used'
                ? 'Link je već iskorišćen. Zatraži novi link za reset lozinke.'
                : 'Link nije validan. Zatraži novi link za reset lozinke.'}
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>
            <p className="font-semibold text-neutral-900">
              Lozinka je uspešno promenjena.
            </p>
            <p className="text-sm text-neutral-500">
              Možeš da se prijaviš sa novom lozinkom. Sve aktivne sesije su
              odjavljene.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
                Nova lozinka
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
                Potvrdi lozinku
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>

            {(validationError || error) && (
              <p className="text-sm text-red-600">{validationError ?? error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'submitting' ? 'Čuvam…' : 'Postavi novu lozinku'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
