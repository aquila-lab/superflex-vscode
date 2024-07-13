import { v4 as uuidv4 } from 'uuid';

export interface EventMessage {
  id: string;
  command: string;
  data?: any;
  error?: string;
}

export function newEventMessage(command: string, data?: any): EventMessage {
  return { id: uuidv4(), command, data };
}
