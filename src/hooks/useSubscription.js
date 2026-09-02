import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Returns the current user's subscription status.
 * `isSubscribed` is true only when subscription_status === 'active'.
 */
export function useSubscription() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  return {
    isSubscribed: user?.subscription_status === 'active',
    subscriptionPlan: user?.subscription_plan,
    user,
    isLoading,
  };
}