'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Package, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const TABS = ['Products', 'Suppliers'] as const
type Tab = typeof TABS[number]
const CATEGORIES = ['Supplement','Apparel','Accessory','Equipment','Beverage','Other']

export default function InventoryPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('Products')
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', category: 'Supplement', unit: 'piece', sellingPriceRupees: '', currentStock: '', lowStockAlert: '5', brand: '' })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['inventory-products', search],
    queryFn: () => api.get(`/inventory/products?search=${search}`),
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ['inventory-suppliers'],
    queryFn: () => api.get('/inventory/suppliers'),
    enabled: tab === 'Suppliers',
  })

  const addMutation = useMutation({
    mutationFn: (d: Record<string,unknown>) => api.post('/inventory/products', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-products'] }); setShowAdd(false) },
  })

  const stockValue = products.reduce((s: number, p: Record<string,unknown>) => s + (Number(p.sellingPriceInPaise) * Number(p.currentStock)), 0)
  const lowStock = products.filter((p: Record<string,unknown>) => Number(p.currentStock) > 0 && Number(p.currentStock) <= Number(p.lowStockAlert)).length
  const outOfStock = products.filter((p: Record<string,unknown>) => Number(p.currentStock) === 0).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2">
          <Plus size={14} />
          {tab === 'Suppliers' ? 'Add Supplier' : 'Add Product'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Stock Value', value: formatRupees(stockValue), color: 'text-green-600' },
          { label: 'Low Stock', value: lowStock, color: 'text-yellow-600' },
          { label: 'Out of Stock', value: outOfStock, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800 flex gap-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('pb-3 text-sm font-medium border-b-2 transition-colors', tab===t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Products' && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, brand..." className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Name','Category','Selling Price','Stock','Status','Actions'].map(c => (
                    <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400"><Package size={32} className="mx-auto mb-2 text-gray-300" />No products yet. Add your first product.</td></tr>
                ) : (products as Record<string,unknown>[]).map((p) => {
                  const stock = Number(p.currentStock)
                  const low = Number(p.lowStockAlert)
                  const stockStatus = stock === 0 ? 'out' : stock <= low ? 'low' : 'ok'
                  return (
                    <tr key={String(p._id)} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{String(p.name)}</p>
                        {p.brand ? <p className="text-xs text-gray-400">{String(p.brand)}</p> : null}
                      </td>
                      <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{String(p.category)}</span></td>
                      <td className="px-4 py-3 font-semibold">{formatRupees(Number(p.sellingPriceInPaise))}</td>
                      <td className="px-4 py-3 font-medium">{stock} {String(p.unit)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', stockStatus==='out' ? 'bg-red-100 text-red-700' : stockStatus==='low' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700')}>
                          {stockStatus==='out' ? 'Out of Stock' : stockStatus==='low' ? '⚠ Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><button className="text-xs text-orange-600 hover:underline">Edit</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'Suppliers' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Name','Contact Person','Phone','Email','GST'].map(c => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(suppliers as Record<string,unknown>[]).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">No suppliers yet</td></tr>
              ) : (suppliers as Record<string,unknown>[]).map((s) => (
                <tr key={String(s._id)} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{String(s.name)}</td>
                  <td className="px-4 py-3 text-gray-600">{String(s.contactPerson ?? '—')}</td>
                  <td className="px-4 py-3 text-gray-600">{String(s.phone ?? '—')}</td>
                  <td className="px-4 py-3 text-gray-600">{String(s.email ?? '—')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{String(s.gstNumber ?? '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && tab === 'Products' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Product</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Whey Protein" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Selling Price (₹) *</label>
                  <input type="number" value={form.sellingPriceRupees} onChange={e=>setForm({...form,sellingPriceRupees:e.target.value})} placeholder="0" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Opening Stock</label>
                  <input type="number" value={form.currentStock} onChange={e=>setForm({...form,currentStock:e.target.value})} placeholder="0" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Alert</label>
                  <input type="number" value={form.lowStockAlert} onChange={e=>setForm({...form,lowStockAlert:e.target.value})} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                <input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="Brand name" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => addMutation.mutate({ name: form.name, category: form.category, unit: form.unit, sellingPriceInPaise: Math.round(parseFloat(form.sellingPriceRupees||'0')*100), currentStock: parseInt(form.currentStock||'0'), lowStockAlert: parseInt(form.lowStockAlert||'5'), brand: form.brand })}
                disabled={addMutation.isPending || !form.name || !form.sellingPriceRupees}
                className="flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 text-sm font-semibold"
              >
                {addMutation.isPending ? 'Saving...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
