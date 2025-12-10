import type { PlanTier } from '@prisma/client'

/**
 * Feature flags based on plan tier
 * These functions determine what features are available for each plan
 */

export function canUseAdvancedReports(planTier: PlanTier): boolean {
  return planTier === 'STANDARD' || planTier === 'PREMIUM'
}

export function canUseSecureChat(planTier: PlanTier): boolean {
  return planTier === 'STANDARD' || planTier === 'PREMIUM'
}

export function canUseBulkOperations(planTier: PlanTier): boolean {
  return planTier === 'PREMIUM'
}

export function canUseCustomBranding(planTier: PlanTier): boolean {
  return planTier === 'PREMIUM'
}

export function canUseAPI(planTier: PlanTier): boolean {
  return planTier === 'PREMIUM'
}

export function canUsePrioritySupport(planTier: PlanTier): boolean {
  return planTier === 'PREMIUM'
}

export function canUseAdvancedAnalytics(planTier: PlanTier): boolean {
  return planTier === 'PREMIUM'
}

/**
 * Get all feature flags for a plan tier
 */
export function getFeatureFlags(planTier: PlanTier) {
  return {
    advancedReports: canUseAdvancedReports(planTier),
    secureChat: canUseSecureChat(planTier),
    bulkOperations: canUseBulkOperations(planTier),
    customBranding: canUseCustomBranding(planTier),
    apiAccess: canUseAPI(planTier),
    prioritySupport: canUsePrioritySupport(planTier),
    advancedAnalytics: canUseAdvancedAnalytics(planTier),
  }
}

/**
 * Get plan tier display name
 */
export function getPlanTierDisplayName(planTier: PlanTier): string {
  switch (planTier) {
    case 'FREE':
      return 'Free'
    case 'STANDARD':
      return 'Standard'
    case 'PREMIUM':
      return 'Premium'
    default:
      return planTier
  }
}

/**
 * Get plan tier description
 */
export function getPlanTierDescription(planTier: PlanTier): string {
  switch (planTier) {
    case 'FREE':
      return 'Basic document exchange and messaging'
    case 'STANDARD':
      return 'Advanced reports and secure chat'
    case 'PREMIUM':
      return 'All features including API access and priority support'
    default:
      return ''
  }
}


