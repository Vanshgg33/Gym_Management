'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserPlus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffUser {
  _id: string
  name: string
  phone: string
  role: 'manager' | 'frontdesk' | 'trainer' | 'other'
  isActive: boolean
  joiningDate?: string
  isArchived: boolean
  staffCode?: string
  specialisation?: string
}

interface GymClass {
  _id: string
  name: string
  category?: string
  difficulty?: string
  capacity?: number
  trainerName?: string
  scheduleDays?: string[]
  description?: string
  durationMins?: number
}

type MainTab = 'Staff' | 'Staff Attendance' | 'Classes' | 'Personal Training' | 'Biometric Devices' | 'Broadcasts'
type ClassSubTab = 'Class Types' | 'Weekly Schedule' | 'Enrollment Requests'
type BroadcastSubTab = 'Compose' | 'History'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAIN_TABS: MainTab[] = ['Staff', 'Staff Attendance', 'Classes', 'Personal Training', 'Biometric Devices', 'Broadcasts']

const ROLE_BADGE: Record<StaffUser['role'], string> = {
  manager:   'bg-blue-100 text-blue-700',
  frontdesk: 'bg-green-100 text-green-700',
  trainer:   'bg-purple-100 text-purple-700',
  other:     'bg-gray-100 text-gray-600',
}

const TODAY = new Date().toISOString().split('T')[0]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-gray-200" style={{ width: j === 0 ? 140 : 100 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── Add Staff Modal ───────────────────────────────────────────────────────────

function AddStaffModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: 'frontdesk' as StaffUser['role'],
    joiningDate: TODAY,
    enableSystemAccess: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: () => api.post('/staff', {
      name: form.name.trim(),
      phone: `+91${form.phone.trim()}`,
      role: form.role,
      joiningDate: form.joiningDate || undefined,
      enableSystemAccess: form.enableSystemAccess,
    }),
    onSuccess,
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (validate()) mutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ravi Kumar"
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500',
                errors.name ? 'border-red-400' : 'border-gray-200'
              )}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">+91</span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="9876543210"
                maxLength={10}
                className={cn(
                  'flex-1 rounded-r-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500',
                  errors.phone ? 'border-red-400' : 'border-gray-200'
                )}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffUser['role'] }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="frontdesk">Front Desk</option>
              <option value="trainer">Trainer</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            <input
              type="date"
              value={form.joiningDate}
              onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, enableSystemAccess: !f.enableSystemAccess }))}
              className={cn(
                'relative w-10 h-6 rounded-full transition-colors',
                form.enableSystemAccess ? 'bg-orange-500' : 'bg-gray-300'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                form.enableSystemAccess ? 'translate-x-5' : 'translate-x-1'
              )} />
            </button>
            <span className="text-sm text-gray-700">Enable System Access</span>
          </label>

          {mutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {(mutation.error as Error)?.message ?? 'Failed to add staff. Please try again.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {mutation.isPending ? 'Adding…' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Staff Modal ──────────────────────────────────────────────────────────

function EditStaffModal({ staff, onClose, onSuccess }: { staff: StaffUser; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: staff.name,
    role: staff.role,
    specialisation: staff.specialisation ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => api.patch(`/staff/${staff._id}`, {
      name: form.name.trim(),
      role: form.role,
      specialisation: form.specialisation.trim() || undefined,
    }),
    onSuccess,
  })

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (form.name.trim()) mutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Staff</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffUser['role'] }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="frontdesk">Front Desk</option>
              <option value="trainer">Trainer</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
            <input
              type="text"
              value={form.specialisation}
              onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))}
              placeholder="e.g. Yoga, CrossFit"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {(mutation.error as Error)?.message ?? 'Failed to update staff.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !form.name.trim()}
              className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create Class Modal (3-step) ───────────────────────────────────────────────

const CLASS_CATEGORIES = ['Yoga', 'HIIT', 'Strength', 'Cardio', 'Dance', 'Pilates', 'Boxing', 'Spinning', 'CrossFit', 'Meditation', 'Other']
const CLASS_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CreateClassForm {
  name: string
  description: string
  category: string
  difficulty: string
  durationMins: number
  capacity: number
  trainerName: string
  days: string[]
  startTime: string
  endTime: string
}

function CreateClassModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<CreateClassForm>({
    name: '', description: '', category: 'Yoga', difficulty: 'All Levels',
    durationMins: 60, capacity: 20, trainerName: '', days: [], startTime: '07:00', endTime: '08:00',
  })

  const mutation = useMutation({
    mutationFn: () => api.post('/classes', form),
    onSuccess,
  })

  function toggleDay(d: string) {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }))
  }

  const stepLabels = ['Details', 'Schedule', 'Review']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Class</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3 — {stepLabels[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-orange-500' : 'bg-gray-200')} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Morning Yoga Flow"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Short description…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CLASS_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CLASS_DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={form.durationMins}
                  onChange={e => setForm(f => ({ ...f, durationMins: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Name</label>
              <input
                type="text"
                value={form.trainerName}
                onChange={e => setForm(f => ({ ...f, trainerName: e.target.value }))}
                placeholder="Anita Sharma"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
              <div className="flex gap-2 flex-wrap">
                {WEEK_DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                      form.days.includes(d)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <Row label="Class Name" value={form.name || '—'} />
              <Row label="Category" value={form.category} />
              <Row label="Difficulty" value={form.difficulty} />
              <Row label="Duration" value={`${form.durationMins} mins`} />
              <Row label="Capacity" value={`${form.capacity} people`} />
              <Row label="Trainer" value={form.trainerName || '—'} />
              <Row label="Days" value={form.days.length ? form.days.join(', ') : '—'} />
              <Row label="Time" value={`${form.startTime} – ${form.endTime}`} />
            </div>
            {mutation.isError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {(mutation.error as Error)?.message ?? 'Failed to create class.'}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
              disabled={step === 1 && !form.name.trim()}
              className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {mutation.isPending ? 'Creating…' : 'Create Class'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// ─── Staff Tab ─────────────────────────────────────────────────────────────────

function StaffTab() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null)

  const { data: staff = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ['staff', search, showArchived],
    queryFn: () => api.get(`/staff?includeArchived=${showArchived}`),
  })

  const filtered = staff.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  )

  const totalCount = staff.length
  const activeCount = staff.filter(s => s.isActive && !s.isArchived).length

  function handleArchive(id: string) {
    api.patch(`/staff/${id}/archive`, {}).then(() =>
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : totalCount}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : activeCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          <UserPlus size={16} />
          Add Staff
        </button>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ml-1">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
            className="accent-orange-500 h-4 w-4 rounded"
          />
          Show Archived
        </label>

        <div className="relative ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="rounded-lg border border-gray-200 bg-white pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Name', 'Phone', 'Role', 'Joining Date', 'Status', 'Actions'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={6} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  {search ? 'No staff match your search.' : 'No staff added yet.'}
                </td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s._id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {s.staffCode && <p className="text-xs text-gray-400">{s.staffCode}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize', ROLE_BADGE[s.role])}>
                      {s.role === 'frontdesk' ? 'Front Desk' : s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {s.joiningDate ? formatDate(s.joiningDate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.isArchived ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Archived</span>
                    ) : s.isActive ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditTarget(s)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(s._id)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        {s.isArchived ? 'Restore' : 'Archive'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddStaffModal
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false)
            queryClient.invalidateQueries({ queryKey: ['staff'] })
          }}
        />
      )}
      {editTarget && (
        <EditStaffModal
          staff={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null)
            queryClient.invalidateQueries({ queryKey: ['staff'] })
          }}
        />
      )}
    </div>
  )
}

// ─── Staff Attendance Tab ──────────────────────────────────────────────────────

function StaffAttendanceTab() {
  const [date, setDate] = useState(new Date())

  function shift(days: number) {
    setDate(d => {
      const n = new Date(d)
      n.setDate(n.getDate() + days)
      return n
    })
  }

  const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Day picker */}
      <div className="flex items-center gap-3">
        <button onClick={() => shift(-1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-800 w-44 text-center">{label}</span>
        <button onClick={() => shift(1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Present', count: 0, cls: 'bg-green-100 text-green-700' },
          { label: 'Late',    count: 0, cls: 'bg-yellow-100 text-yellow-700' },
          { label: 'Absent',  count: 0, cls: 'bg-red-100 text-red-600' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', cls)}>
            <span>{label}</span>
            <span className="font-bold">{count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Name', 'Role', 'Check-in Time', 'Check-out Time', 'Status'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                No attendance data for this day.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Classes Tab ───────────────────────────────────────────────────────────────

function ClassesTab() {
  const queryClient = useQueryClient()
  const [subTab, setSubTab] = useState<ClassSubTab>('Class Types')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: classes = [], isLoading } = useQuery<GymClass[]>({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes'),
    enabled: subTab === 'Class Types',
  })

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['Class Types', 'Weekly Schedule', 'Enrollment Requests'] as ClassSubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              subTab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Class Types' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              + Create Class
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white">
              <p className="font-medium text-gray-600">No classes yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first class to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(c => (
                <div key={c._id} className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    {c.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">
                        {c.category}
                      </span>
                    )}
                  </div>
                  {c.difficulty && <p className="text-xs text-gray-500">{c.difficulty}</p>}
                  {c.trainerName && <p className="text-xs text-gray-500">Trainer: {c.trainerName}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                    {c.capacity && <span>{c.capacity} max</span>}
                    {c.scheduleDays?.length ? <span>{c.scheduleDays.join(', ')}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'Weekly Schedule' && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white">
          <p className="text-sm text-gray-400">No classes scheduled this week.</p>
        </div>
      )}

      {subTab === 'Enrollment Requests' && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white">
          <p className="text-sm text-gray-400">No pending enrollment requests.</p>
        </div>
      )}

      {createOpen && (
        <CreateClassModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false)
            queryClient.invalidateQueries({ queryKey: ['classes'] })
          }}
        />
      )}
    </div>
  )
}

// ─── Personal Training Tab ─────────────────────────────────────────────────────

function PersonalTrainingTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          Assign Trainer
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Member', 'Trainer', 'Package', 'Sessions', 'Status'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                No personal training assignments yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Biometric Devices Tab ─────────────────────────────────────────────────────

function BiometricDevicesTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          + Add Device
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Brand', 'Model', 'Serial', 'Status'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                No devices configured.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Broadcasts Tab ────────────────────────────────────────────────────────────

function BroadcastsTab() {
  const [subTab, setSubTab] = useState<BroadcastSubTab>('Compose')
  const [form, setForm] = useState({
    service: 'SMS',
    audience: 'Active Members',
    messageType: 'Transactional',
    template: '',
  })

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-gray-200">
        {(['Compose', 'History'] as BroadcastSubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              subTab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Compose' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={form.service}
              onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>SMS</option>
              <option>Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select
              value={form.audience}
              onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Visitors</option>
              <option>Active Members</option>
              <option>Expired Members</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
            <select
              value={form.messageType}
              onChange={e => setForm(f => ({ ...f, messageType: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>Transactional</option>
              <option>Promotional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <select
              value={form.template}
              onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select a template…</option>
              <option>Membership Renewal Reminder</option>
              <option>Welcome Message</option>
              <option>Payment Receipt</option>
            </select>
          </div>
          <button className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 transition-colors">
            Send Broadcast
          </button>
        </div>
      )}

      {subTab === 'History' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Date', 'Service', 'Audience', 'Message Type', 'Status'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  No broadcasts sent yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('Staff')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Staff &amp; Operations</h1>
      </div>

      {/* Main tabs */}
      <div className="flex gap-0.5 overflow-x-auto border-b border-gray-200 pb-0">
        {MAIN_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              activeTab === tab
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'Staff' && <StaffTab />}
        {activeTab === 'Staff Attendance' && <StaffAttendanceTab />}
        {activeTab === 'Classes' && <ClassesTab />}
        {activeTab === 'Personal Training' && <PersonalTrainingTab />}
        {activeTab === 'Biometric Devices' && <BiometricDevicesTab />}
        {activeTab === 'Broadcasts' && <BroadcastsTab />}
      </div>
    </div>
  )
}
