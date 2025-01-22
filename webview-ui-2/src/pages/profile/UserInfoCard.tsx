import { User } from '../../../../shared/model';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const UserInfoCard = ({ user }: { user: User }) => (
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
);
