'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface MealItem {
  name: string
  quantity?: string
}

interface Meal {
  slot: string
  name: string
  items: MealItem[]
  note?: string
}

interface DietPlan {
  _id: string
  name: string
  description?: string
  goal: string
  dietType: 'veg' | 'non_veg' | 'egg_itarian' | 'vegan'
  dailyCalories?: number
  proteinLevel: 'low' | 'moderate' | 'high' | 'very_high'
  isTemplate: boolean
  status?: 'active' | 'archived'
  meals: Meal[]
}

const MEAL_SLOTS = [
  'Early Morning',
  'Breakfast',
  'Mid Morning',
  'Lunch',
  'Evening Snack',
  'Pre-Workout',
  'Post-Workout',
  'Dinner',
  'Bedtime',
]

const DIET_TYPE_LABELS: Record<string, string> = {
  veg: 'Veg',
  non_veg: 'Non-Veg',
  egg_itarian: 'Egg-itarian',
  vegan: 'Vegan',
}

const DIET_TYPE_COLORS: Record<string, string> = {
  veg: 'bg-green-100 text-green-700',
  non_veg: 'bg-orange-100 text-orange-700',
  egg_itarian: 'bg-yellow-100 text-yellow-700',
  vegan: 'bg-emerald-100 text-emerald-700',
}

const PROTEIN_LABELS: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
}

const PROTEIN_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-600',
  moderate: 'bg-indigo-100 text-indigo-600',
  high: 'bg-purple-100 text-purple-700',
  very_high: 'bg-pink-100 text-pink-700',
}

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general_fitness', label: 'General Fitness' },
]

const GOAL_FILTER_OPTIONS = ['all', 'weight_loss', 'muscle_gain', 'maintenance', 'general_fitness']

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
  general_fitness: 'General Fitness',
}

const GOAL_COLORS: Record<string, string> = {
  weight_loss: 'bg-red-100 text-red-700',
  muscle_gain: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-gray-100 text-gray-700',
  general_fitness: 'bg-green-100 text-green-700',
}

function ThreeDotMenu({ onArchive, onDuplicate, onEdit }: {
  onArchive: () => void
  onDuplicate: () => void
  onEdit: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-white shadow-lg border border-gray-100 py-1 text-sm">
            <button onClick={() => { setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Assign to Member</button>
            <button onClick={() => { onEdit(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Edit</button>
            <button onClick={() => { onDuplicate(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Duplicate</button>
            <button onClick={() => { onArchive(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">Archive</button>
          </div>
        </>
      )}
    </div>
  )
}

function PlanCard({ plan, onArchive, onDuplicate, onEdit }: {
  plan: DietPlan
  onArchive: () => void
  onDuplicate: () => void
  onEdit: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const goalLabel = GOAL_LABELS[plan.goal] ?? plan.goal
  const goalColor = GOAL_COLORS[plan.goal] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {plan.status === 'archived' && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
          <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Archived</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{plan.name}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', goalColor)}>
                {goalLabel}
              </span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', DIET_TYPE_COLORS[plan.dietType])}>
                {DIET_TYPE_LABELS[plan.dietType]}
              </span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', PROTEIN_COLORS[plan.proteinLevel])}>
                {PROTEIN_LABELS[plan.proteinLevel]} Protein
              </span>
            </div>
          </div>
          <ThreeDotMenu onArchive={onArchive} onDuplicate={onDuplicate} onEdit={onEdit} />
        </div>

        {plan.dailyCalories && (
          <p className="text-xs text-gray-500 mt-2">{plan.dailyCalories} kcal/day</p>
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          {expanded ? 'Hide Meals ▲' : 'Show Meals ▼'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-1.5 border-t border-gray-50 pt-3">
            {plan.meals.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No meals configured</p>
            ) : (
              plan.meals.map((meal, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">{meal.slot}</span>
                    {meal.name && <span className="text-gray-700">— {meal.name}</span>}
                  </div>
                  <span className="text-gray-400">{meal.items.length} item{meal.items.length !== 1 ? 's' : ''}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="flex gap-2 mb-2">
        <div className="h-5 bg-gray-100 rounded-full w-20" />
        <div className="h-5 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/4 mt-2" />
    </div>
  )
}

interface MealDraft {
  slot: string
  enabled: boolean
  name: string
  items: { name: string; quantity: string }[]
}

function makeMealDrafts(): MealDraft[] {
  return MEAL_SLOTS.map(slot => ({ slot, enabled: true, name: '', items: [] }))
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('general_fitness')
  const [dietType, setDietType] = useState<DietPlan['dietType']>('veg')
  const [dailyCalories, setDailyCalories] = useState('')
  const [proteinLevel, setProteinLevel] = useState<DietPlan['proteinLevel']>('moderate')
  const [mealDrafts, setMealDrafts] = useState<MealDraft[]>(makeMealDrafts)

  const mutation = useMutation({
    mutationFn: (body: object) => api.post('/diet-plans', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diet-plans'] })
      onClose()
    },
  })

  function toggleMeal(i: number, enabled: boolean) {
    setMealDrafts(prev => prev.map((m, idx) => idx === i ? { ...m, enabled } : m))
  }

  function updateMeal(i: number, patch: Partial<MealDraft>) {
    setMealDrafts(prev => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m))
  }

  function addItem(mealIdx: number) {
    setMealDrafts(prev => prev.map((m, idx) =>
      idx === mealIdx ? { ...m, items: [...m.items, { name: '', quantity: '' }] } : m
    ))
  }

  function updateItem(mealIdx: number, itemIdx: number, patch: { name?: string; quantity?: string }) {
    setMealDrafts(prev => prev.map((m, mi) =>
      mi === mealIdx
        ? { ...m, items: m.items.map((it, ii) => ii === itemIdx ? { ...it, ...patch } : it) }
        : m
    ))
  }

  function removeItem(mealIdx: number, itemIdx: number) {
    setMealDrafts(prev => prev.map((m, mi) =>
      mi === mealIdx ? { ...m, items: m.items.filter((_, ii) => ii !== itemIdx) } : m
    ))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const meals: Meal[] = mealDrafts
      .filter(m => m.enabled)
      .map(m => ({
        slot: m.slot,
        name: m.name,
        items: m.items.filter(it => it.name).map(it => ({ name: it.name, quantity: it.quantity || undefined })),
      }))
    mutation.mutate({
      name,
      description,
      goal,
      dietType,
      dailyCalories: dailyCalories ? Number(dailyCalories) : undefined,
      proteinLevel,
      isTemplate: true,
      meals,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Create Diet Template</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Template Name *</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. High Protein Veg Plan"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Diet Type</label>
              <select value={dietType} onChange={e => setDietType(e.target.value as DietPlan['dietType'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
                <option value="egg_itarian">Egg-itarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Daily Calories (kcal)</label>
              <input
                type="number" min={0}
                value={dailyCalories}
                onChange={e => setDailyCalories(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Protein Level</label>
              <select value={proteinLevel} onChange={e => setProteinLevel(e.target.value as DietPlan['proteinLevel'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Meal Slots</p>
            {mealDrafts.map((meal, i) => (
              <div key={meal.slot} className={cn(
                'rounded-xl border p-3 space-y-2 transition-colors',
                meal.enabled ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white opacity-50'
              )}>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={meal.enabled}
                      onChange={e => toggleMeal(i, e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">{meal.slot}</span>
                  </label>
                  {meal.enabled && (
                    <input
                      value={meal.name}
                      onChange={e => updateMeal(i, { name: e.target.value })}
                      placeholder="Meal name (e.g. Oatmeal Bowl)"
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  )}
                </div>

                {meal.enabled && (
                  <div className="pl-5 space-y-1.5">
                    {meal.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-1.5">
                        <input
                          value={item.name}
                          onChange={e => updateItem(i, ii, { name: e.target.value })}
                          placeholder="Item name"
                          className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          value={item.quantity}
                          onChange={e => updateItem(i, ii, { quantity: e.target.value })}
                          placeholder="Qty (e.g. 100g)"
                          className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(i, ii)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(i)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {mutation.isPending ? 'Creating…' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DietPlansPage() {
  const [goalFilter, setGoalFilter] = useState('all')
  const [dietTypeFilter, setDietTypeFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data: plans = [], isLoading, isError } = useQuery<DietPlan[]>({
    queryKey: ['diet-plans'],
    queryFn: () => api.get('/diet-plans'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/diet-plans/${id}/archive`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diet-plans'] }),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/diet-plans/${id}/duplicate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diet-plans'] }),
  })

  const filtered = plans.filter(p => {
    const matchGoal = goalFilter === 'all' || p.goal === goalFilter
    const matchDiet = dietTypeFilter === 'all' || p.dietType === dietTypeFilter
    return matchGoal && matchDiet
  })

  return (
    <div className="space-y-5">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Diet Plans</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + Create Template
        </button>
      </div>

      {/* Goal filter chips */}
      <div className="flex flex-wrap gap-2">
        {GOAL_FILTER_OPTIONS.map(g => (
          <button
            key={g}
            onClick={() => setGoalFilter(g)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              goalFilter === g ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {g === 'all' ? 'All' : GOAL_LABELS[g] ?? g}
          </button>
        ))}
      </div>

      {/* Diet type filter chips */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'veg', 'non_veg', 'egg_itarian', 'vegan'] as const).map(dt => (
          <button
            key={dt}
            onClick={() => setDietTypeFilter(dt)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              dietTypeFilter === dt ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {dt === 'all' ? 'All Types' : DIET_TYPE_LABELS[dt]}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          Failed to load diet plans. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">
            {plans.length === 0 ? 'Create Your First Diet Template' : 'No templates match your filters'}
          </p>
          {plans.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Get started →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(plan => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onArchive={() => archiveMutation.mutate(plan._id)}
              onDuplicate={() => duplicateMutation.mutate(plan._id)}
              onEdit={() => {/* edit modal: add if needed */}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
