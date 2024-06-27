import { uuid } from "uuidv4";

export interface EventMessage {
  id: string;
  command: string;
  data?: any;
}

export function newRequestEventMessage(
  command: string,
  data?: any
): EventMessage {
  return { id: uuid(), command, data };
}

export function newResponseEventMessage(
  id: string,
  command: string,
  data?: any
): EventMessage {
  return { id, command, data };
}
