import { MessageType, Role } from '../../../../shared/model';

export type ChatMessage = {
  id: string;
  role: Role;
  type: MessageType;
  content: string;
};
