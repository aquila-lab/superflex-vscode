import React, { useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '@radix-ui/react-progress';
import { Badge } from '../../components/ui/Badge';

const ProfileView: React.FC = () => {
  const {
    user,
    subscription,
    isUserLoading,
    isSubscriptionLoading,
    handleSubscribe,
    handleManageBilling,
    fetchSubscription
  } = useUser();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  if (isUserLoading || isSubscriptionLoading) {
    return <div className="p-4">Loading user information...</div>;
  }

  if (!user || !subscription?.plan) {
    return <div className="p-4">Could not load user data or subscription info.</div>;
  }

  return (
    <div className="flex-1 w-full p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-16">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold truncate">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription.endDate && (
            <Badge variant="destructive">
              Your subscription has been canceled and will end on {new Date(subscription.endDate).toLocaleDateString()}.
            </Badge>
          )}

          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{subscription.plan.name}</p>
            </div>

            {user.stripeCustomerID && !subscription.plan.name.toLowerCase().includes('free') ? (
              <Button onClick={handleManageBilling}>Manage Billing</Button>
            ) : (
              <Button onClick={handleSubscribe}>Subscribe</Button>
            )}
          </div>

          <div className="space-y-4">
            <CardDescription>Usage</CardDescription>
            <UsageDisplay
              label="Premium Requests"
              used={subscription.premiumRequestsUsed}
              limit={subscription.plan.premiumRequestLimit}
            />
            <UsageDisplay
              label="Basic Requests"
              used={subscription.basicRequestsUsed}
              limit={subscription.plan.basicRequestLimit}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;

interface UsageDisplayProps {
  label: string;
  used: number;
  limit: number;
}
const UsageDisplay: React.FC<UsageDisplayProps> = ({ label, used, limit }) => {
  const percentage = limit > 9999 ? 0 : (used / limit) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{limit > 9999 ? 'Unlimited' : `${used} / ${limit}`}</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
};
