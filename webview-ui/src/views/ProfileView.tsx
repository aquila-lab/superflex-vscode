import React, { useEffect } from 'react';
import { VSCodeWrapper } from '../api/vscodeApi';
import { EventMessage, EventPayloads, EventType, newEventRequest } from '../../../shared/protocol/events';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useAppDispatch, useAppSelector } from '../core/store';
import { setUser, setUserSubscription } from '../core/user/userSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { APP_BASE_URL } from '../../../shared/common/constants';

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
    vscodeAPI.postMessage(newEventRequest(EventType.OPEN_EXTERNAL_URL, { url: `${APP_BASE_URL}/pricing` }));
  }

  function handleManageBilling(): void {
    console.log('Manage Billing clicked');
  }

  if (!user.subscription?.plan) {
    return <div className="p-4">Loading user information...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{user.subscription?.plan?.name}</p>
            </div>
            {user.stripeCustomerID ? (
              <Button onClick={handleManageBilling}>Manage Billing</Button>
            ) : (
              <Button onClick={handleSubscribe}>Subscribe</Button>
            )}
          </div>

          <div className="space-y-4">
            <CardDescription>Usage</CardDescription>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Premium Requests</span>
                <span>
                  {user.subscription?.premiumRequestsUsed} / {user.subscription?.plan?.premiumRequestLimit}
                </span>
              </div>
              <Progress
                value={(user.subscription?.premiumRequestsUsed / user.subscription?.plan?.premiumRequestLimit) * 100}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Basic Requests</span>
                <span>
                  {user.subscription?.basicRequestsUsed} / {user.subscription?.plan?.basicRequestLimit}
                </span>
              </div>
              <Progress
                value={(user.subscription?.basicRequestsUsed / user.subscription?.plan?.basicRequestLimit) * 100}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
