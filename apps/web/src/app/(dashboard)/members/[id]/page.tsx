'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Phone, Edit2, Archive, ArchiveRestore } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'

// ---- Types ----
interface Member {
  _id: string
  code: string
  name: string
  phone: string
  email?: string
  gender?: string
  status: 'pending' | 'active' | 'inactive' | 'archived' | 'blocked'
  referenceSource?: string
  dateOfBirth?: string
  photoUrl?: string
  isArchived: boolean
  createdAt: string
  address?: string
  notes?: string
}

interface Membership {
  _id: string
  packageId: string
  packageSnapshot?: { name: string }
  salePriceInPaise: number
  paidInPaise?: number
  startDate: string
  endDate: string
  status?: string
}

interface AttendanceRecord {
  _id: string
  checkIn: string
  checkOut?: string
  source?: string
}

// ---- Constants ----
const STATUS_COLORS: Record<string, string> = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blocked:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const TABS = ['Profile', 'Memberships', 'Attendance', 'Follow-ups', 'Audit Trail'] as const
type Tab = typeof TABS[number]

// ---- Helpers ----
function Avatar({ name, photoUrl, size = 'lg' }: { name: string; photoUrl?: string; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  if (photoUrl) return <img src={photoUrl} alt={name} className={cn('rounded-full object-cover', sz)} />
  return (
    <div className={cn('rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400', sz)}>
      {initials}
    </div>
  )
}

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 12 && clean.startsWith('91')) return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`
  if (clean.length === 10) return `${clean.slice(0, 5)} ${clean.slice(5)}`
  return phone
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

// ---- Skeleton ----
function HeaderSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  )
}

// ---- Profile edit form ----
function ProfileTab({ member, onSaved }: { member: Member; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Member>>({})
  const qc = useQueryClient()

  const save = useMutation({
    mutationFn: () => api.patch(`/api/members/${member._id}`, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['member', member._id] }); setEditing(false); onSaved() },
  })

  function start() { setForm({ name: member.name, phone: member.phone, email: member.email, gender: member.gender, dateOfBirth: member.dateOfBirth, referenceSource: member.referenceSource }); setEditing(true) }
  function set(k: keyof Member, v: string) { setForm(f => ({ ...f, [k]: v })) }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Name', key: 'name' as keyof Member, type: 'text' },
            { label: 'Phone', key: 'phone' as keyof Member, type: 'text' },
            { label: 'Email', key: 'email' as keyof Member, type: 'email' },
            { label: 'Date of Birth', key: 'dateOfBirth' as keyof Member, type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              <input
                type={type}
                value={(form[key] as string) ?? ''}
                onChange={e => set(key, e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Gender</label>
            <div className="relative">
              <select
                value={(form.gender as string) ?? ''}
                onChange={e => set('gender', e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Reference Source</label>
            <input
              type="text"
              value={(form.referenceSource as string) ?? ''}
              onChange={e => set('referenceSource', e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {save.isError && (
          <p className="text-sm text-red-500">{(save.error as Error).message}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" value={member.name} />
        <Field label="Phone" value={formatPhone(member.phone)} />
        <Field label="Email" value={member.email} />
        <Field label="Gender" value={member.gender?.replace('_', ' ')} />
        <Field label="Date of Birth" value={member.dateOfBirth ? formatDate(member.dateOfBirth) : undefined} />
        <Field label="Reference Source" value={member.referenceSource} />
        <Field label="Member Code" value={member.code} />
        <Field label="Status" value={member.status} />
        <Field label="Joined" value={formatDate(member.createdAt)} />
      </div>
      <button
        onClick={start}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors"
      >
        <Edit2 size={14} /> Edit Profile
      </button>
    </div>
  )
}

// ---- Memberships tab ----
function MembershipsTab({ memberId }: { memberId: string }) {
  const { data: memberships = [], isLoading } = useQuery<Membership[]>({
    queryKey: ['memberships', memberId],
    queryFn: () => api.get(`/api/memberships/member/${memberId}`),
  })

  if (isLoading) return <div className="animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700" />)}</div>

  if (!memberships.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No memberships yet.</p>
  }

  return (
    <div className="space-y-3">
      {memberships.map(m => {
        const balance = m.salePriceInPaise - (m.paidInPaise ?? 0)
        return (
          <div key={m._id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {m.packageSnapshot?.name ?? 'Package'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatDate(m.startDate)} → {formatDate(m.endDate)}
                </p>
              </div>
              {m.status && (
                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[m.status] ?? STATUS_COLORS.inactive)}>
                  {m.status}
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Total: <strong className="text-gray-900 dark:text-white">{formatRupees(m.salePriceInPaise)}</strong></span>
              <span>Paid: <strong className="text-green-600">{formatRupees(m.paidInPaise ?? 0)}</strong></span>
              <span>Balance: <strong className={balance > 0 ? 'text-amber-600' : 'text-green-600'}>{formatRupees(balance)}</strong></span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Attendance tab ----
function AttendanceTab({ memberId }: { memberId: string }) {
  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', memberId],
    queryFn: () => api.get(`/api/attendance/member/${memberId}`),
  })

  if (isLoading) return <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />)}</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{records.length} total visits</p>
      </div>
      {records.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No attendance recorded yet.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {['Date', 'Check-in', 'Check-out', 'Source'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{formatDate(r.checkIn)}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {r.checkOut
                      ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : <span className="text-green-600 dark:text-green-400 text-xs font-medium">Active</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.source && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                        {r.source}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Main page ----
export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('Profile')

  const { data: member, isLoading } = useQuery<Member>({
    queryKey: ['member', id],
    queryFn: () => api.get(`/api/members/${id}`),
    enabled: !!id,
  })

  const archiveMutation = useMutation({
    mutationFn: () =>
      member?.isArchived
        ? api.patch(`/api/members/${id}/restore`, {})
        : api.patch(`/api/members/${id}/archive`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['member', id] }),
  })

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push('/members')}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={15} /> Members
      </button>

      {/* Header card */}
      {isLoading || !member ? (
        <HeaderSkeleton />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <Avatar name={member.name} photoUrl={member.photoUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold">
                  {member.code}
                </span>
                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[member.status])}>
                  {member.status}
                </span>
              </div>
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mt-1 transition-colors"
              >
                <Phone size={13} /> {formatPhone(member.phone)}
              </a>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setTab('Profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-60"
              >
                {member.isArchived
                  ? <><ArchiveRestore size={13} /> Restore</>
                  : <><Archive size={13} /> Archive</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        {!member ? null : tab === 'Profile' ? (
          <ProfileTab member={member} onSaved={() => {}} />
        ) : tab === 'Memberships' ? (
          <MembershipsTab memberId={id} />
        ) : tab === 'Attendance' ? (
          <AttendanceTab memberId={id} />
        ) : tab === 'Follow-ups' ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No follow-ups yet.</p>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No audit events yet.</p>
        )}
      </div>
    </div>
  )
}
