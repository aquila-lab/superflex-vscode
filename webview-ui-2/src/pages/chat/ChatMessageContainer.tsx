import { ReactNode } from 'react';
import { Role } from '../../../../shared/model';
import { cn } from '../../common/utils';

export const ChatMessageContainer = ({ role, children }: { role: Role; children: ReactNode }) => {
  return (
    <div className={cn('py-4 px-4 rounded-lg', role === Role.User ? 'bg-muted' : undefined)}>
      {children}
    </div>
  );
};
