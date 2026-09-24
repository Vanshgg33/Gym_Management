'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/formatters'

interface Reply {
  authorName: string
  body: string
  createdAt: string
}

interface Ticket {
  _id: string
  subject: string
  ticketType: 'platform' | 'internal' | 'member_feedback' | 'plan_request'
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'waiting_for_client' | 'resolved' | 'closed'
  description?: string
  raisedById?: string
  replies: Reply[]
  isRead: boolean
  createdAt: string
}

const TABS = ['Platform Support', 'Internal Tickets', 'Member Feedback', 'Plan Requests'] as const
type Tab = typeof TABS[number]

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

const PRIORITY_COLORS: Record<Ticket['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

const STATUS_COLORS: Record<Ticket['status'], string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  waiting_for_client: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<Ticket['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_for_client: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
}

const STATUS_FILTER_MAP: Record<StatusFilter, Ticket['status'] | null> = {
  All: null,
  Open: 'open',
  'In Progress': 'in_progress',
  Waiting: 'waiting_for_client',
  Resolved: 'resolved',
  Closed: 'closed',
}

const CATEGORIES = ['General', 'Billing', 'Technical', 'Feature Request', 'Bug Report']
const PRIORITIES: Ticket['priority'][] = ['low', 'medium', 'high']

const INPUT = "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: i === 1 ? '60%' : '40%' }} />
        </td>
      ))}
    </tr>
  )
}

// New / Edit Ticket Modal
function TicketModal({
  ticketType,
  onClose,
  onSuccess,
}: {
  ticketType: 'platform' | 'internal'
  onClose: () => void
  onSuccess: () => void
}) {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [priority, setPriority] = useState<Ticket['priority']>('medium')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/api/support/tickets', { subject, category, priority, description, ticketType }),
    onSuccess: () => { onSuccess(); onClose() },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {ticketType === 'platform' ? 'New Support Ticket' : 'New Internal Ticket'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Subject *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className={INPUT} placeholder="Briefly describe your issue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Ticket['priority'])} className={INPUT}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={cn(INPUT, 'resize-none')} placeholder="Provide details..." />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => { if (!subject.trim()) { setError('Subject is required'); return } mutation.mutate() }}
              disabled={mutation.isPending}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// View / Reply Modal
function ViewModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState('')

  const replyMutation = useMutation({
    mutationFn: () =>
      api.post(`/api/support/tickets/${ticket._id}/reply`, { authorId: 'me', authorName: 'Me', body: replyBody }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setReplyBody('')
    },
    onError: (e: Error) => setReplyError(e.message),
  })

  const resolveMutation = useMutation({
    mutationFn: () => api.patch(`/api/support/tickets/${ticket._id}`, { status: 'resolved' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h2>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', PRIORITY_COLORS[ticket.priority])}>
                {ticket.priority}
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[ticket.status])}>
                {STATUS_LABELS[ticket.status]}
              </span>
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">{ticket.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {ticket.description && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-700 dark:text-gray-300">
              {ticket.description}
            </div>
          )}

          {ticket.replies.length === 0 && !ticket.description && (
            <p className="text-sm text-gray-400 text-center py-4">No replies yet.</p>
          )}

          {ticket.replies.map((r, i) => (
            <div key={i} className={cn('flex gap-3', r.authorName === 'Me' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[80%] rounded-xl px-4 py-2.5 text-sm',
                r.authorName === 'Me'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
              )}>
                <p className="font-medium text-xs mb-1 opacity-70">{r.authorName}</p>
                <p>{r.body}</p>
                <p className={cn('text-xs mt-1 opacity-60', r.authorName === 'Me' ? 'text-right' : '')}>
                  {formatDate(r.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-2">
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            rows={2}
            placeholder="Write a reply..."
            className={cn(INPUT, 'resize-none')}
          />
          {replyError && <p className="text-xs text-red-600">{replyError}</p>}
          <div className="flex justify-between items-center">
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Mark Resolved
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => { if (!replyBody.trim()) return; replyMutation.mutate() }}
              disabled={replyMutation.isPending || !replyBody.trim()}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              {replyMutation.isPending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Shared ticket table for Platform + Internal tabs
function TicketTable({ ticketType }: { ticketType: 'platform' | 'internal' }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [showNewModal, setShowNewModal] = useState(false)
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null)

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['tickets', ticketType],
    queryFn: () => api.get(`/api/support/tickets?ticketType=${ticketType}`),
  })

  const filtered = statusFilter === 'All'
    ? tickets
    : tickets.filter(t => t.status === STATUS_FILTER_MAP[statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors whitespace-nowrap"
        >
          + {ticketType === 'platform' ? 'New Ticket' : 'New Internal Ticket'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1, 2, 3].map(i => <SkeletonRow key={i} />)}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  No support tickets yet
                </td>
              </tr>
            )}
            {!isLoading && filtered.map(ticket => (
              <tr key={ticket._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                  {ticket.subject}
                  {!ticket.isRead && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">{ticket.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', PRIORITY_COLORS[ticket.priority])}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[ticket.status])}>
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setViewTicket(ticket)}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    View / Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewModal && (
        <TicketModal
          ticketType={ticketType}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tickets', ticketType] })}
        />
      )}
      {viewTicket && <ViewModal ticket={viewTicket} onClose={() => setViewTicket(null)} />}
    </div>
  )
}

function MemberFeedbackTab() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Staff Feedback</h3>
        <p className="text-xs text-gray-400 mb-4">Average ratings from member surveys</p>
        <div className="flex flex-col items-center justify-center py-8 text-sm text-gray-400">
          No feedback received yet
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Gym &amp; Facility Feedback</h3>
        <p className="text-xs text-gray-400 mb-4">General facility and equipment ratings</p>
        <div className="flex flex-col items-center justify-center py-8 text-sm text-gray-400">
          No feedback received yet
        </div>
      </div>
    </div>
  )
}

function PlanRequestsTab() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Member</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Plan Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Requested</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
              No plan requests yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function SupportPage() {
  const [tab, setTab] = useState<Tab>('Platform Support')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support</h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Platform Support' && <TicketTable ticketType="platform" />}
      {tab === 'Internal Tickets' && <TicketTable ticketType="internal" />}
      {tab === 'Member Feedback' && <MemberFeedbackTab />}
      {tab === 'Plan Requests' && <PlanRequestsTab />}
    </div>
  )
}
