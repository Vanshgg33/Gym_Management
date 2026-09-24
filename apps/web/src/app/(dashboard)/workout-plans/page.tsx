'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Exercise {
  exerciseName: string
  sets?: number
  reps?: number
  durationMinutes?: number
  restSeconds?: number
  notes?: string
}

interface Day {
  dayNumber: number
  name: string
  focus?: string
  isRestDay: boolean
  exercises: Exercise[]
}

interface WorkoutPlan {
  _id: string
  name: string
  description?: string
  goal: 'weight_loss' | 'muscle_gain' | 'general_fitness' | 'strength' | 'endurance' | 'toning'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek: number
  targetGender: 'any' | 'male' | 'female'
  isTemplate: boolean
  status: 'active' | 'archived'
  days: Day[]
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  general_fitness: 'General Fitness',
  strength: 'Strength',
  endurance: 'Endurance',
  toning: 'Toning',
}

const GOAL_COLORS: Record<string, string> = {
  weight_loss: 'bg-red-100 text-red-700',
  muscle_gain: 'bg-blue-100 text-blue-700',
  general_fitness: 'bg-green-100 text-green-700',
  strength: 'bg-orange-100 text-orange-700',
  endurance: 'bg-purple-100 text-purple-700',
  toning: 'bg-pink-100 text-pink-700',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

const GOALS = ['all', 'weight_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance', 'toning'] as const

function makeDays(n: number): Day[] {
  return Array.from({ length: n }, (_, i) => ({
    dayNumber: i + 1,
    name: `Day ${i + 1}`,
    focus: '',
    isRestDay: false,
    exercises: [],
  }))
}

function ThreeDotMenu({ plan, onArchive, onDuplicate, onEdit }: {
  plan: WorkoutPlan
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
            <button onClick={() => { onEdit(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Edit Details</button>
            <button onClick={() => { onDuplicate(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Duplicate</button>
            <button onClick={() => { onArchive(); setOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">Archive</button>
          </div>
        </>
      )}
    </div>
  )
}

function PlanCard({ plan, onArchive, onDuplicate, onEdit }: {
  plan: WorkoutPlan
  onArchive: () => void
  onDuplicate: () => void
  onEdit: () => void
}) {
  const [expanded, setExpanded] = useState(false)
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
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', GOAL_COLORS[plan.goal])}>
                {GOAL_LABELS[plan.goal]}
              </span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', DIFFICULTY_COLORS[plan.difficulty])}>
                {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
              </span>
            </div>
          </div>
          <ThreeDotMenu plan={plan} onArchive={onArchive} onDuplicate={onDuplicate} onEdit={onEdit} />
        </div>

        <p className="text-xs text-gray-500 mt-2">{plan.daysPerWeek} days/week · {plan.targetGender === 'any' ? 'Any gender' : plan.targetGender === 'male' ? 'Male' : 'Female'}</p>

        {plan.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{plan.description}</p>
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          {expanded ? 'Hide Days ▲' : 'Show Days ▼'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 border-t border-gray-50 pt-3">
            {plan.days.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No days configured</p>
            ) : (
              plan.days.map((day) => (
                <div key={day.dayNumber} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{day.name}</span>
                    {day.isRestDay ? (
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Rest</span>
                    ) : day.focus ? (
                      <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">{day.focus}</span>
                    ) : null}
                  </div>
                  {!day.isRestDay && (
                    <span className="text-gray-400">{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}</span>
                  )}
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
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5 mt-1" />
    </div>
  )
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState<WorkoutPlan['goal']>('general_fitness')
  const [difficulty, setDifficulty] = useState<WorkoutPlan['difficulty']>('beginner')
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [targetGender, setTargetGender] = useState<WorkoutPlan['targetGender']>('any')
  const [days, setDays] = useState<Day[]>(() => makeDays(4))

  const mutation = useMutation({
    mutationFn: (body: object) => api.post('/workout-plans', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans'] })
      onClose()
    },
  })

  // sync days array when daysPerWeek changes
  function handleDaysPerWeek(n: number) {
    setDaysPerWeek(n)
    setDays(prev => {
      if (n > prev.length) {
        return [...prev, ...makeDays(n).slice(prev.length)]
      }
      return prev.slice(0, n)
    })
  }

  function updateDay(i: number, patch: Partial<Day>) {
    setDays(prev => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d))
  }

  function addExercise(dayIdx: number) {
    setDays(prev => prev.map((d, idx) =>
      idx === dayIdx
        ? { ...d, exercises: [...d.exercises, { exerciseName: '', sets: 3, reps: 10, restSeconds: 60 }] }
        : d
    ))
  }

  function updateExercise(dayIdx: number, exIdx: number, patch: Partial<Exercise>) {
    setDays(prev => prev.map((d, idx) =>
      idx === dayIdx
        ? { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? { ...e, ...patch } : e) }
        : d
    ))
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    setDays(prev => prev.map((d, idx) =>
      idx === dayIdx ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) } : d
    ))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ name, description, goal, difficulty, daysPerWeek, targetGender, isTemplate: true, days })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Create Workout Template</h2>
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
                placeholder="e.g. 4-Day Push Pull Legs"
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
              <select value={goal} onChange={e => setGoal(e.target.value as WorkoutPlan['goal'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                {Object.entries(GOAL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as WorkoutPlan['difficulty'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Days per Week</label>
              <select value={daysPerWeek} onChange={e => handleDaysPerWeek(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Gender</label>
              <select value={targetGender} onChange={e => setTargetGender(e.target.value as WorkoutPlan['targetGender'])}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Days</p>
            {days.map((day, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={day.name}
                    onChange={e => updateDay(i, { name: e.target.value })}
                    placeholder={`Day ${i + 1}`}
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    value={day.focus ?? ''}
                    onChange={e => updateDay(i, { focus: e.target.value })}
                    placeholder="Focus (e.g. Chest)"
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={day.isRestDay}
                      onChange={e => updateDay(i, { isRestDay: e.target.checked })}
                      className="accent-orange-500"
                    />
                    Rest Day
                  </label>
                </div>

                {!day.isRestDay && (
                  <div className="space-y-1.5">
                    {day.exercises.map((ex, ei) => (
                      <div key={ei} className="flex items-center gap-1.5 flex-wrap">
                        <input
                          value={ex.exerciseName}
                          onChange={e => updateExercise(i, ei, { exerciseName: e.target.value })}
                          placeholder="Exercise name"
                          className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          type="number" min={1} value={ex.sets ?? ''}
                          onChange={e => updateExercise(i, ei, { sets: Number(e.target.value) })}
                          placeholder="Sets"
                          className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          type="number" min={1} value={ex.reps ?? ''}
                          onChange={e => updateExercise(i, ei, { reps: Number(e.target.value) })}
                          placeholder="Reps"
                          className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          type="number" min={0} value={ex.restSeconds ?? ''}
                          onChange={e => updateExercise(i, ei, { restSeconds: Number(e.target.value) })}
                          placeholder="Rest (s)"
                          className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(i, ei)}
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
                      onClick={() => addExercise(i)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      + Add Exercise
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

export default function WorkoutPlansPage() {
  const [goalFilter, setGoalFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data: plans = [], isLoading, isError } = useQuery<WorkoutPlan[]>({
    queryKey: ['workout-plans', goalFilter],
    queryFn: () => api.get('/workout-plans'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workout-plans/${id}/archive`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workout-plans/${id}/duplicate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })

  const filtered = plans.filter((p) => {
    const matchGoal = goalFilter === 'all' || p.goal === goalFilter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchGoal && matchSearch
  })

  return (
    <div className="space-y-5">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Workout Plans</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + Create Template
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Goal filter chips */}
      <div className="flex flex-wrap gap-2">
        {GOALS.map(g => (
          <button
            key={g}
            onClick={() => setGoalFilter(g)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              goalFilter === g
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {g === 'all' ? 'All' : GOAL_LABELS[g]}
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
          Failed to load workout plans. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 6h16.5M3.75 18h16.5" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">
            {plans.length === 0 ? 'Create Your First Workout Template' : 'No templates match your filters'}
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
