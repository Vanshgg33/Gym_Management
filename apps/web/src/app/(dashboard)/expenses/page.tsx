'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Receipt, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRupees, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Rent','Electricity','Water','Internet','Equipment','Repairs & Maintenance','Cleaning Supplies','Marketing','Staff Salary','Trainer Commission','Insurance','Licenses & Permits','Other']
const METHODS = ['cash','upi','bank_transfer','cheque']

export default function ExpensesPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [showPettyCash, setShowPettyCash] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), amountRupees: '', category: 'Other', paymentMethod: 'cash', vendor: '', notes: '', fromPettyCash: false })

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.get('/expenses'),
  })

  const { data: pettyCash } = useQuery({
    queryKey: ['petty-cash-balance'],
    queryFn: () => api.get('/expenses/petty-cash/balance'),
  })

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/expenses', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setShowAdd(false); setForm({ date: new Date().toISOString().slice(0,10), amountRupees: '', category: 'Other', paymentMethod: 'cash', vendor: '', notes: '', fromPettyCash: false }) },
  })

  const handleAdd = () => {
    if (!form.amountRupees || !form.vendor) return
    addMutation.mutate({
      date: new Date(form.date).toISOString(),
      amountInPaise: Math.round(parseFloat(form.amountRupees) * 100),
      category: form.category,
      paymentMethod: form.paymentMethod,
      vendor: form.vendor,
      notes: form.notes,
      fromPettyCash: form.fromPettyCash,
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expenses & Petty Cash</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowPettyCash(true)} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Wallet size={14} />
            Petty Cash {pettyCash?.balance !== undefined ? `(${formatRupees(pettyCash.balance)})` : ''}
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2">
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {['Date','Category','Vendor','Amount','Method','Notes'].map(c => (
                <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({length:4}).map((_,i)=>(
                <tr key={i} className="border-b border-gray-50"><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td></tr>
              ))
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400"><Receipt size={32} className="mx-auto mb-2 text-gray-300" />No expenses recorded yet</td></tr>
            ) : expenses.map((e: Record<string,unknown>) => (
              <tr key={String(e._id)} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(String(e.date))}</td>
                <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{String(e.category)}</span></td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{String(e.vendor)}</td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatRupees(Number(e.amountInPaise))}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{String(e.paymentMethod).replace('_',' ')}</td>
                <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-xs">{String(e.notes ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Expense</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (₹) *</label>
                  <input type="number" placeholder="0" value={form.amountRupees} onChange={e=>setForm({...form,amountRupees:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category *</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Method *</label>
                  <select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {METHODS.map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Vendor/Payee *</label>
                  <input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})} placeholder="Vendor name" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional notes" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.fromPettyCash} onChange={e=>setForm({...form,fromPettyCash:e.target.checked})} className="rounded" />
                Pay from petty cash
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleAdd} disabled={addMutation.isPending} className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 text-sm font-semibold">
                {addMutation.isPending ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPettyCash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Petty Cash</h2>
              <button onClick={() => setShowPettyCash(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-4 text-center">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Cash In Hand</p>
              <p className="text-3xl font-bold text-orange-600">{pettyCash?.balance !== undefined ? formatRupees(pettyCash.balance) : '—'}</p>
            </div>
            <p className="text-sm text-gray-500 text-center">Top-up and movement tracking coming soon.</p>
            <button onClick={() => setShowPettyCash(false)} className="w-full rounded-lg bg-orange-500 text-white py-2 text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
