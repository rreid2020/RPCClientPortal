'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPlanTierDisplayName, getPlanTierDescription, type PlanTier } from '@/lib/featureFlags'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface PlanUpgradeCardProps {
  currentPlan: PlanTier
}

export function PlanUpgradeCard({ currentPlan }: PlanUpgradeCardProps) {
  const plans: { tier: PlanTier; name: string; description: string; price: string }[] = [
    {
      tier: 'FREE',
      name: 'Free',
      description: 'Basic document exchange and messaging',
      price: '$0',
    },
    {
      tier: 'STANDARD',
      name: 'Standard',
      description: 'Advanced reports and secure chat',
      price: '$29/month',
    },
    {
      tier: 'PREMIUM',
      name: 'Premium',
      description: 'All features including API access and priority support',
      price: '$99/month',
    },
  ]

  const handleUpgrade = (tier: PlanTier) => {
    // TODO: Integrate with Stripe for payment processing
    alert(`Upgrade to ${tier} plan - Stripe integration coming soon!`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Your Plan</CardTitle>
        <CardDescription>
          Unlock more features with a paid plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentPlan
            const isUpgrade = 
              (currentPlan === 'FREE' && plan.tier === 'STANDARD') ||
              (currentPlan === 'FREE' && plan.tier === 'PREMIUM') ||
              (currentPlan === 'STANDARD' && plan.tier === 'PREMIUM')

            return (
              <div
                key={plan.tier}
                className={`p-4 border rounded-lg ${
                  isCurrent ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {isCurrent && <Badge variant="info">Current</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{plan.price}</p>
                  </div>
                  {isUpgrade && (
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(plan.tier)}
                      className="ml-4"
                    >
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Payment processing via Stripe will be integrated in a future update.
            For now, plan upgrades can be managed by firm administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


