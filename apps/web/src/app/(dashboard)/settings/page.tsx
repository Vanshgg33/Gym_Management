'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface GymSettings {
  gymName?: string
  ownerName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  memberIdPrefix?: string
  termsAndConditions?: string
  autoCheckOut?: { enabled: boolean; minutes: number }
  gstNumber?: string
  sgst?: number
  cgst?: number
  plan?: string
  memberLimit?: number
  staffLimit?: number
  smsCredits?: number
  whatsappCredits?: number
  emailCredits?: number
}

const TABS = ['General', 'Tax', 'Permissions', 'Communications', 'Member QR', 'Audit Trail', 'Billing & Quota', 'Daily Pulse'] as const
type Tab = typeof TABS[number]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

const INPUT = "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
const INPUT_RO = INPUT + " opacity-60 cursor-not-allowed"

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center text-sm text-gray-400 dark:text-gray-500">
      {text}
    </div>
  )
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('General')

  const { data: settings = {} as GymSettings } = useQuery<GymSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  })

  // Local form state — only for General + Tax (the functional tabs)
  const [gymName, setGymName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [prefix, setPrefix] = useState('')
  const [terms, setTerms] = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoMinutes, setAutoMinutes] = useState(60)
  const [gst, setGst] = useState('')
  const [sgst, setSgst] = useState(0)
  const [cgst, setCgst] = useState(0)

  // Populate form once settings load
  useEffect(() => {
    if (!settings.gymName) return
    setGymName(settings.gymName ?? '')
    setEmail(settings.email ?? '')
    setPhone(settings.phone ?? '')
    setAddress(settings.address ?? '')
    setCity(settings.city ?? '')
    setPrefix(settings.memberIdPrefix ?? '')
    setTerms(settings.termsAndConditions ?? '')
    setAutoEnabled(settings.autoCheckOut?.enabled ?? false)
    setAutoMinutes(settings.autoCheckOut?.minutes ?? 60)
    setGst(settings.gstNumber ?? '')
    setSgst(settings.sgst ?? 0)
    setCgst(settings.cgst ?? 0)
  }, [settings.gymName]) // ponytail: fires once when data lands; re-fetches don't reset user edits

  const generalMutation = useMutation({
    mutationFn: () => api.patch('/api/settings', {
      gymName, email, phone, address, city,
      memberIdPrefix: prefix,
      termsAndConditions: terms,
      autoCheckOut: { enabled: autoEnabled, minutes: autoMinutes },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  const taxMutation = useMutation({
    mutationFn: () => api.patch('/api/settings', { gstNumber: gst, sgst, cgst }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'General' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <Field label="Gym Name">
            <input value={gymName} onChange={e => setGymName(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Owner Name">
            <input value={settings.ownerName ?? ''} readOnly className={INPUT_RO} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Phone">
              <input value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="Address">
            <input value={address} onChange={e => setAddress(e.target.value)} className={INPUT} />
          </Field>
          <Field label="City">
            <input value={city} onChange={e => setCity(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Member ID Prefix (2–6 uppercase letters)">
            <input
              value={prefix}
              onChange={e => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="GYM"
              className={INPUT}
            />
          </Field>
          <Field label="Terms &amp; Conditions">
            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4} className={cn(INPUT, 'resize-none')} />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Check-Out</p>
              <p className="text-xs text-gray-400">Automatically check out members after N minutes</p>
            </div>
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={e => setAutoEnabled(e.target.checked)}
              className="accent-orange-500 h-4 w-4"
            />
          </div>
          {autoEnabled && (
            <Field label="Auto Check-Out After (minutes)">
              <input
                type="number"
                min={15}
                max={720}
                value={autoMinutes}
                onChange={e => setAutoMinutes(Number(e.target.value))}
                className={INPUT}
              />
            </Field>
          )}
          <button
            onClick={() => generalMutation.mutate()}
            disabled={generalMutation.isPending}
            className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            {generalMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          {generalMutation.isError && (
            <p className="text-xs text-red-600 dark:text-red-400">{(generalMutation.error as Error).message}</p>
          )}
          {generalMutation.isSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>
          )}
        </div>
      )}

      {/* Tax */}
      {tab === 'Tax' && (
        <div className="max-w-sm space-y-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <Field label="GST Number (15 chars)">
            <input value={gst} onChange={e => setGst(e.target.value.toUpperCase().slice(0, 15))} maxLength={15} className={INPUT} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SGST %">
              <input type="number" min={0} max={100} step={0.1} value={sgst} onChange={e => setSgst(Number(e.target.value))} className={INPUT} />
            </Field>
            <Field label="CGST %">
              <input type="number" min={0} max={100} step={0.1} value={cgst} onChange={e => setCgst(Number(e.target.value))} className={INPUT} />
            </Field>
          </div>
          <Field label="Total GST %">
            <input value={(sgst + cgst).toFixed(1)} readOnly className={INPUT_RO} />
          </Field>
          <button
            onClick={() => taxMutation.mutate()}
            disabled={taxMutation.isPending}
            className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            {taxMutation.isPending ? 'Saving…' : 'Save'}
          </button>
          {taxMutation.isError && (
            <p className="text-xs text-red-600 dark:text-red-400">{(taxMutation.error as Error).message}</p>
          )}
          {taxMutation.isSuccess && <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>}
        </div>
      )}

      {tab === 'Permissions' && <Placeholder text="Permission management coming soon" />}

      {tab === 'Communications' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            {['SMS', 'Email', 'WhatsApp'].map(s => (
              <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s}</span>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">Configure templates coming soon</p>
        </div>
      )}

      {tab === 'Member QR' && (
        <div className="max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Public Join Link</p>
          <div className="flex items-center gap-2">
            <input readOnly value="http://localhost:3000/join" className={cn(INPUT_RO, 'flex-1')} />
            <button
              onClick={() => navigator.clipboard.writeText('http://localhost:3000/join')}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-40 text-sm text-gray-400 dark:text-gray-500">
            QR code here
          </div>
        </div>
      )}

      {tab === 'Audit Trail' && <Placeholder text="Audit trail coming soon" />}

      {tab === 'Billing & Quota' && (
        <div className="max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Plan</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{settings.plan ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Member Limit</span>
              <span className="font-medium text-gray-900 dark:text-white">{settings.memberLimit ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Staff Limit</span>
              <span className="font-medium text-gray-900 dark:text-white">{settings.staffLimit ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">SMS / WhatsApp Credits</span>
              <span className="font-medium text-gray-900 dark:text-white">{settings.smsCredits ?? 0} / {settings.whatsappCredits ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Email Credits</span>
              <span className="font-medium text-gray-900 dark:text-white">{settings.emailCredits ?? 0}</span>
            </div>
          </div>
          <button className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-2 text-sm font-semibold text-white transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}

      {tab === 'Daily Pulse' && <Placeholder text="Daily Pulse coming soon" />}
    </div>
  )
}
