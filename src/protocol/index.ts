import { uuid } from "uuidv4";

export interface EventMessage {
  id: string;
  command: string;
  data?: any;
  error?: string;
}

export function newRequestEventMessage(
  command: string,
  data?: any
): EventMessage {
  return { id: uuid(), command, data };
}

export function newResponseEventMessage(
  req: EventMessage,
  resData?: any
): EventMessage {
  return { id: req.id, command: req.command, data: resData };
}
