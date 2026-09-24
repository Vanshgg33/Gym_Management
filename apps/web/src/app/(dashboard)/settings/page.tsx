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

// ─── Permissions Tab ────────────────────────────────────────────────────────

const PERMISSIONS_DATA = [
  {
    role: 'Manager',
    pages: 'Dashboard, Members, Follow-ups, Attendance, Plans, Support, Reports',
    actions: 'Collect Due, Edit Member, Delete Member, Add Staff, View Reports',
  },
  {
    role: 'Front Desk',
    pages: 'Dashboard, Members, Attendance, Support',
    actions: 'Collect Due, Edit Member',
  },
  {
    role: 'Trainer',
    pages: 'Dashboard, Attendance, Plans, Settings',
    actions: '—',
  },
]

function PermissionsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-32">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Pages Access</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Special Actions</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS_DATA.map((row, i) => (
              <tr key={row.role} className={cn('border-b border-gray-50 dark:border-gray-800/50', i === PERMISSIONS_DATA.length - 1 && 'border-0')}>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {row.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{row.pages}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{row.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
        To change permissions, edit the Settings schema directly (UI coming soon).
      </p>
    </div>
  )
}

// ─── Communications Tab ─────────────────────────────────────────────────────

type CommSub = 'SMS' | 'Email' | 'WhatsApp'

interface Template {
  name: string
  defaultOn: boolean
}

const SMS_TEMPLATES: Template[] = [
  { name: 'Welcome Member', defaultOn: true },
  { name: 'Payment Received', defaultOn: true },
  { name: 'Member Checkin Alert', defaultOn: false },
  { name: 'Membership Expiring Today', defaultOn: true },
  { name: 'Membership Expiring (7 Days)', defaultOn: true },
  { name: 'Payment Overdue', defaultOn: false },
  { name: 'Walk-In Enquiry Welcome', defaultOn: false },
  { name: 'Birthday & Anniversary Greeting', defaultOn: true },
  { name: 'Subscription Expiration Notice', defaultOn: false },
  { name: 'Owner: Package Expiring Today', defaultOn: true },
  { name: 'Check-Out Alert', defaultOn: false },
  { name: 'Subscription Purchase Confirmation', defaultOn: true },
  { name: 'Visitor Follow-Up Reminder', defaultOn: false },
]

const EMAIL_TEMPLATES: Template[] = [
  { name: 'Member Welcome', defaultOn: true },
  { name: 'Payment Confirmation', defaultOn: true },
  { name: 'Invoice', defaultOn: true },
  { name: 'Renewal Reminder', defaultOn: true },
  { name: 'Membership Expired', defaultOn: true },
  { name: 'Staff Welcome', defaultOn: true },
  { name: 'Login OTP', defaultOn: true },
]

const WHATSAPP_TEMPLATES: Template[] = [
  { name: 'Membership Expiry Today', defaultOn: false },
  { name: 'Renewal Reminder 7 Days', defaultOn: false },
  { name: 'Member Welcome', defaultOn: false },
  { name: 'Owner Daily Business Summary', defaultOn: false },
  { name: 'Login OTP', defaultOn: false },
  { name: 'Owner Package Expiry Today', defaultOn: false },
  { name: 'Payment Confirmation', defaultOn: false },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        on ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
          on ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function TemplateList({ templates, disabled }: { templates: Template[]; disabled?: boolean }) {
  const [states, setStates] = useState<boolean[]>(() => templates.map(t => t.defaultOn))
  const toggle = (i: number) => setStates(s => s.map((v, idx) => idx === i ? !v : v))

  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-800">
      {templates.map((t, i) => (
        <div key={t.name} className="flex items-center justify-between py-2.5 px-1">
          <span className={cn('text-sm text-gray-800 dark:text-gray-200', disabled && 'opacity-40')}>{t.name}</span>
          <Toggle on={states[i]} onChange={() => !disabled && toggle(i)} />
        </div>
      ))}
    </div>
  )
}

function CommunicationsTab() {
  const [sub, setSub] = useState<CommSub>('SMS')

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
      <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 pb-3">
        {(['SMS', 'Email', 'WhatsApp'] as CommSub[]).map(s => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              sub === s
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Changes will be saved automatically.
      </p>

      {sub === 'SMS' && (
        <>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            SMS Templates ({SMS_TEMPLATES.length})
          </p>
          <TemplateList templates={SMS_TEMPLATES} />
        </>
      )}

      {sub === 'Email' && (
        <>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Email Templates ({EMAIL_TEMPLATES.length})
          </p>
          <TemplateList templates={EMAIL_TEMPLATES} />
        </>
      )}

      {sub === 'WhatsApp' && (
        <>
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
            WhatsApp is disabled. Enable in Settings &gt; Communications to use templates.
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            WhatsApp Templates ({WHATSAPP_TEMPLATES.length})
          </p>
          <TemplateList templates={WHATSAPP_TEMPLATES} disabled />
        </>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('General')

  const { data: settings = {} as GymSettings } = useQuery<GymSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  })

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

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 dark:border-red-900 p-4 mt-6">
            <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-3">Deleting the account permanently removes all data. This cannot be undone.</p>
            <button disabled className="rounded-lg border border-red-300 text-red-600 text-sm px-4 py-2 opacity-50 cursor-not-allowed">
              Delete Account
            </button>
            <p className="text-xs text-gray-400 mt-2">To delete your account, contact support.</p>
          </div>
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

      {tab === 'Permissions' && <PermissionsTab />}

      {tab === 'Communications' && <CommunicationsTab />}

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
