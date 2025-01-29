import { Message } from "./Message.model";

export type Thread = {
  /** @type {Generics.UUID} */
  id: string;

  title: string;
  messages: Message[];

  updatedAt: Date;
  createdAt: Date;
};

export type ThreadRun = {
  messages: Message[];
  isPremium: boolean;
};
