import type { Message, MessageStream } from './Message.model'

export type Thread = {
  /** @type {Generics.UUID} */
  id: string

  title: string | null
  messages: Message[]

  updatedAt: Date
  createdAt: Date
}

export type ThreadRun = {
  stream: AsyncIterable<MessageStream>
  response(): Promise<{ messages: Message[]; isPremium: boolean }>
}
