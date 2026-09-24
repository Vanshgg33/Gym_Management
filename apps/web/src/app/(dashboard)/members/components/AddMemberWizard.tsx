'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { formatRupees } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Package {
  _id: string
  name: string
  priceInPaise: number
  durationDays: number
  type: 'membership' | 'pt' | 'sunnyHour'
  isArchived: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type MemberType = 'member' | 'visitor'

// ---------- helpers ----------
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function numToWords(n: number): string {
  if (n === 0) return 'Zero'
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '')
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
  return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
}

function paiseToWords(paise: number): string {
  const rupees = Math.floor(paise / 100)
  const p = paise % 100
  let result = numToWords(rupees) + ' Rupees'
  if (p > 0) result += ' and ' + numToWords(p) + ' Paise'
  return result + ' Only'
}

// ---------- Field components ----------
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500',
        className
      )}
    />
  )
}

function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          'w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500',
          className
        )}
      />
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ---------- Step indicators ----------
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all',
            i + 1 === step ? 'w-6 bg-orange-500' : i + 1 < step ? 'w-2 bg-orange-300' : 'w-2 bg-gray-200 dark:bg-gray-700'
          )}
        />
      ))}
    </div>
  )
}

// ---------- Main wizard ----------
export function AddMemberWizard({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [memberType, setMemberType] = useState<MemberType>('member')
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Step 1 fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [dob, setDob] = useState('')
  const [refSource, setRefSource] = useState('')
  const [address, setAddress] = useState('')
  const [notes1, setNotes1] = useState('')

  // Step 2 member fields
  const [packageId, setPackageId] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [salePriceRupees, setSalePriceRupees] = useState('')
  const [payingNowRupees, setPayingNowRupees] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [txRef, setTxRef] = useState('')
  const [includeGST, setIncludeGST] = useState(false)
  const [notes2, setNotes2] = useState('')

  // Step 2 visitor fields
  const [followUpType, setFollowUpType] = useState('visitor_followup')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')

  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => api.get('/api/packages'),
    enabled: isOpen,
  })

  const activePackages = packages.filter(p => !p.isArchived)
  const selectedPkg = activePackages.find(p => p._id === packageId)

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  // Auto-calc end date
  useEffect(() => {
    if (selectedPkg && startDate) {
      setEndDate(addDays(startDate, selectedPkg.durationDays - 1))
    }
  }, [selectedPkg, startDate])

  // Pre-fill sale price when package changes
  useEffect(() => {
    if (selectedPkg) {
      setSalePriceRupees((selectedPkg.priceInPaise / 100).toFixed(0))
    }
  }, [selectedPkg])

  const salePricePaise = Math.round(parseFloat(salePriceRupees || '0') * 100)
  const payingNowPaise = Math.round(parseFloat(payingNowRupees || '0') * 100)
  const balancePaise = salePricePaise - payingNowPaise
  const toCollectPaise = Math.max(0, balancePaise)

  function reset() {
    setStep(1); setMemberType('member'); setShowMore(false); setError('')
    setName(''); setPhone(''); setGender(''); setEmail(''); setAgeGroup('')
    setDob(''); setRefSource(''); setAddress(''); setNotes1('')
    setPackageId(''); setStartDate(todayISO()); setEndDate(''); setSalePriceRupees('')
    setPayingNowRupees(''); setPayMethod('cash'); setTxRef(''); setIncludeGST(false); setNotes2('')
    setFollowUpType('visitor_followup'); setFollowUpDate(''); setFollowUpNotes('')
  }

  function handleClose() { reset(); onClose() }

  function validateStep1() {
    if (!name.trim()) return 'Name is required'
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) return 'Valid 10-digit phone required'
    if (!gender) return 'Gender is required'
    return ''
  }

  function validateStep2Member() {
    if (!packageId) return 'Select a package'
    if (!startDate) return 'Start date required'
    if (payingNowPaise > salePricePaise) return 'Amount paying now cannot exceed sale price'
    return ''
  }

  function validateStep2Visitor() {
    if (!followUpDate) return 'Follow-up date required'
    if (!followUpNotes.trim()) return 'Notes required'
    return ''
  }

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      // 1. Create member
      const rawPhone = phone.replace(/\D/g, '')
      const fullPhone = rawPhone.length === 10 ? `+91${rawPhone}` : `+${rawPhone}`
      const memberBody: Record<string, unknown> = {
        name: name.trim(),
        phone: fullPhone,
        gender,
        ...(email && { email }),
        ...(dob && { dateOfBirth: dob }),
        ...(refSource && { referenceSource: refSource }),
        ...(address && { address }),
        ...(notes1 && { notes: notes1 }),
        memberType,
      }
      const member = await api.post('/api/members', memberBody)
      const memberId: string = member._id ?? member.id

      if (memberType === 'member' && packageId && selectedPkg) {
        // 2. Create membership
        const membership = await api.post('/api/memberships', {
          memberId,
          packageId,
          packageSnapshot: selectedPkg,
          salePriceInPaise: salePricePaise,
          startDate,
          endDate,
        })
        const membershipId: string = membership._id ?? membership.id

        // 3. Payment if > 0
        if (payingNowPaise > 0) {
          await api.post('/api/payments', {
            membershipId,
            memberId,
            entries: [{ method: payMethod, amountInPaise: payingNowPaise, ...(txRef && { txRef }) }],
            totalInPaise: payingNowPaise,
            date: new Date().toISOString(),
            receivedById: 'self',
            ...(notes2 && { notes: notes2 }),
          })
        }
      }

      reset()
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const totalSteps = memberType === 'visitor' ? 3 : 3

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Add Member / Visitor' : step === 2 ? (memberType === 'visitor' ? 'Follow-up Details' : 'Package & Payment') : 'Confirm'}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <StepDots step={step} total={totalSteps} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Member / Visitor toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 gap-0.5">
                {(['member', 'visitor'] as MemberType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setMemberType(t)}
                    className={cn(
                      'flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                      memberType === t
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <Label required>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
              </div>

              <div>
                <Label required>Phone</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                    +91
                  </span>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label required>Gender</Label>
                <Select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </Select>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="optional" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Age Group</Label>
                  <Select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
                    <option value="">Select</option>
                    <option value="under_20">Under 20</option>
                    <option value="20_35">20–35</option>
                    <option value="35_50">35–50</option>
                    <option value="over_50">Over 50</option>
                  </Select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dob} onChange={e => setDob(e.target.value)} max={todayISO()} />
                </div>
              </div>

              <div>
                <Label>Reference Source</Label>
                <Select value={refSource} onChange={e => setRefSource(e.target.value)}>
                  <option value="">Select source</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="social_media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="online">Online</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              {/* Collapsible more */}
              <button
                type="button"
                onClick={() => setShowMore(v => !v)}
                className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium"
              >
                <ChevronRight size={14} className={cn('transition-transform', showMore && 'rotate-90')} />
                {showMore ? 'Less details' : 'Add more details'}
              </button>

              {showMore && (
                <div className="space-y-4 pt-1">
                  <div>
                    <Label>Address</Label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Optional address" />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <textarea
                      value={notes1}
                      onChange={e => setNotes1(e.target.value)}
                      placeholder="Any notes…"
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2 MEMBER ── */}
          {step === 2 && memberType === 'member' && (
            <div className="space-y-4">
              <div>
                <Label required>Package</Label>
                <Select value={packageId} onChange={e => setPackageId(e.target.value)}>
                  <option value="">Select a package</option>
                  {activePackages.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {formatRupees(p.priceInPaise)} / {p.durationDays}d
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Start Date</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} readOnly={!!selectedPkg} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Sale Price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={salePriceRupees}
                      onChange={e => setSalePriceRupees(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Paying Now (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={parseFloat(salePriceRupees || '0')}
                      value={payingNowRupees}
                      onChange={e => setPayingNowRupees(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Method</Label>
                    <Select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Txn / UTR Ref</Label>
                    <Input value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="optional" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <div className="space-y-0.5">
                    <p className="text-gray-600 dark:text-gray-400">
                      To collect: <span className="font-semibold text-gray-900 dark:text-white">{formatRupees(toCollectPaise)}</span>
                    </p>
                    <p className={cn('font-medium', balancePaise > 0 ? 'text-amber-600' : 'text-green-600')}>
                      Balance: {formatRupees(Math.max(0, balancePaise))}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGST}
                      onChange={e => setIncludeGST(e.target.checked)}
                      className="accent-orange-500"
                    />
                    Include GST
                  </label>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <textarea
                  value={notes2}
                  onChange={e => setNotes2(e.target.value)}
                  placeholder="Any notes…"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 VISITOR ── */}
          {step === 2 && memberType === 'visitor' && (
            <div className="space-y-4">
              <div>
                <Label>Follow-up Type</Label>
                <Select value={followUpType} onChange={e => setFollowUpType(e.target.value)}>
                  <option value="visitor_followup">Visitor Follow-up</option>
                  <option value="inquiry_followup">Inquiry Follow-up</option>
                </Select>
              </div>
              <div>
                <Label required>Follow-up Date</Label>
                <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} min={todayISO()} />
              </div>
              <div>
                <Label required>Notes</Label>
                <textarea
                  value={followUpNotes}
                  onChange={e => setFollowUpNotes(e.target.value)}
                  placeholder="What was discussed, what to follow up on…"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3 CONFIRM ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3 text-sm">
                <p className="font-bold text-gray-900 dark:text-white text-base">{name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 dark:text-gray-500">Phone</span>
                  <span>+91 {phone}</span>
                  <span className="text-gray-400 dark:text-gray-500">Type</span>
                  <span className="capitalize">{memberType}</span>
                  {memberType === 'member' && selectedPkg && (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">Package</span>
                      <span>{selectedPkg.name}</span>
                      <span className="text-gray-400 dark:text-gray-500">Dates</span>
                      <span>{startDate} → {endDate}</span>
                      <span className="text-gray-400 dark:text-gray-500">Total</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatRupees(salePricePaise)}</span>
                      <span className="text-gray-400 dark:text-gray-500">Paying now</span>
                      <span className="font-semibold text-green-600">{formatRupees(payingNowPaise)}</span>
                      <span className="text-gray-400 dark:text-gray-500">Balance</span>
                      <span className={cn('font-semibold', balancePaise > 0 ? 'text-amber-600' : 'text-green-600')}>
                        {formatRupees(Math.max(0, balancePaise))}
                      </span>
                    </>
                  )}
                </div>
                {memberType === 'member' && salePricePaise > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic border-t border-gray-200 dark:border-gray-700 pt-2">
                    {paiseToWords(salePricePaise)}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                <span className="text-base leading-none mt-0.5">⚠</span>
                <span>Payments are hard to undo. Please confirm the amount before saving.</span>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                let err = ''
                if (step === 1) err = validateStep1()
                else if (step === 2 && memberType === 'member') err = validateStep2Member()
                else if (step === 2 && memberType === 'visitor') err = validateStep2Visitor()
                if (err) { setError(err); return }
                setError('')
                setStep(s => s + 1)
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Saving…' : '✓ Confirm & Save'}
            </button>
          )}
        </div>

        {/* Inline error above footer */}
        {error && step < 3 && (
          <p className="px-6 pb-3 text-sm text-red-500 -mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
