import React from 'react';
import { useUser } from '../../context/UserContext';
import { BillingCard } from './BillingCard';
import { UserInfoCard } from './UserInfoCard';

const LoadingState = () => <div className="p-4">Loading user information...</div>;

const ErrorState = () => <div className="p-4">Could not load user data or subscription info.</div>;

export const ProfileView: React.FC = () => {
  const {
    user,
    subscription,
    isUserLoading,
    isSubscriptionLoading,
    handleSubscribe,
    handleManageBilling,
    fetchSubscription
  } = useUser();

  React.useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  if (isUserLoading || isSubscriptionLoading) {
    return <LoadingState />;
  }

  if (!user || !subscription?.plan) {
    return <ErrorState />;
  }

  return (
    <div className="flex-1 w-full p-6 space-y-8">
      <UserInfoCard user={user} />
      <BillingCard
        user={user}
        subscription={subscription}
        onManageBilling={handleManageBilling}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default ProfileView;
