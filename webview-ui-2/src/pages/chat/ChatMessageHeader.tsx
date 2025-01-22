import { Role } from '../../../../shared/model';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';

export const ChatMessageHeader = ({
  role,
  picture,
  username
}: {
  role: Role;
  picture: string | null | undefined;
  username: string;
}) => {
  return (
    <div className="flex items-center mb-2">
      {role !== Role.User && (
        <Avatar className="mr-2 size-5">
          <AvatarImage src={window.superflexLogoUri} alt="Superflex Logo" />
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      )}
      {role === Role.User && picture && (
        <Avatar className="mr-2 size-5">
          <AvatarImage src={picture} alt="User Avatar" />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <p className="text-sm font-medium text-primary">{role === Role.User ? username : 'Superflex'}</p>
    </div>
  );
};
