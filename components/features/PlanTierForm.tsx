'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { PlanTier } from '@prisma/client'

interface PlanTierFormProps {
  organizationId: string
  currentPlanTier: PlanTier
}

export function PlanTierForm({ organizationId, currentPlanTier }: PlanTierFormProps) {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<PlanTier>(currentPlanTier)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_tier: selectedTier,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update plan tier')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating plan tier:', error)
      alert('Failed to update plan tier. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={selectedTier}
        onChange={(e) => setSelectedTier(e.target.value as PlanTier)}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        disabled={isSubmitting}
      >
        <option value="FREE">Free</option>
        <option value="STANDARD">Standard</option>
        <option value="PREMIUM">Premium</option>
      </select>
      {selectedTier !== currentPlanTier && (
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Update'}
        </Button>
      )}
    </form>
  )
}


