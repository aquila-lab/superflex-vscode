import React, { useEffect } from 'react';

import { EventMessage, EventPayloads, EventType, newEventRequest } from '../../../shared/protocol/events';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useAppDispatch, useAppSelector } from '../core/store';
import { setUser, setUserSubscription } from '../core/user/userSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

interface UsageDisplayProps {
  label: string;
  used: number;
  limit: number;
}

const UsageDisplay: React.FC<UsageDisplayProps> = ({ label, used, limit }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{limit > 9999 ? 'Unlimited' : `${used} / ${limit}`}</span>
      </div>
      <Progress value={limit > 9999 ? 0 : (used / limit) * 100} />
    </div>
  );
};

const ProfileView: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.GET_USER_INFO: {
          if (error) {
            return;
          }

          const user = payload as EventPayloads[typeof command]['response'];
          dispatch(setUser(user));
          break;
        }
        case EventType.GET_USER_SUBSCRIPTION: {
          if (error) {
            return;
          }

          const subscription = payload as EventPayloads[typeof command]['response'];
          dispatch(setUserSubscription(subscription));
          break;
        }
      }
    });
  }, [vscodeAPI, dispatch]);

  useEffect(() => {
    vscodeAPI.postMessage(newEventRequest(EventType.GET_USER_INFO));
    vscodeAPI.postMessage(newEventRequest(EventType.GET_USER_SUBSCRIPTION));
  }, [vscodeAPI]);

  function handleSubscribe(): void {
    vscodeAPI.postMessage(newEventRequest(EventType.OPEN_EXTERNAL_URL, { url: 'https://app.superflex.ai/pricing' }));
  }

  function handleManageBilling(): void {
    vscodeAPI.postMessage(
      newEventRequest(EventType.OPEN_EXTERNAL_URL, {
        url: `https://billing.stripe.com/p/login/3cs3dQdenfJucIU144?prefilled_email=${encodeURIComponent(user.email)}`
      })
    );
  }

  if (!user.subscription?.plan) {
    return <div className="p-4">Loading user information...</div>;
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
              <p className="text-lg font-semibold truncate">borisboir{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.subscription.endDate && (
            <Badge variant="destructive">
              Your subscription has been canceled and will end on{' '}
              {new Date(user.subscription.endDate).toLocaleDateString()}.
            </Badge>
          )}

          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{user.subscription.plan.name}</p>
            </div>

            {user.stripeCustomerID && !user.subscription.plan.name.toLowerCase().includes('free') ? (
              <Button onClick={handleManageBilling}>Manage Billing</Button>
            ) : (
              <Button onClick={handleSubscribe}>Subscribe</Button>
            )}
          </div>

          <div className="space-y-4">
            <CardDescription>Usage</CardDescription>
            <UsageDisplay
              label="Premium Requests"
              used={user.subscription.premiumRequestsUsed}
              limit={user.subscription.plan.premiumRequestLimit}
            />
            <UsageDisplay
              label="Basic Requests"
              used={user.subscription.basicRequestsUsed}
              limit={user.subscription.plan.basicRequestLimit}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
