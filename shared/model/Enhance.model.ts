export interface EnhancePromptStream {
  /**
   * The type of the stream can be either "delta" or "complete".
   */
  type: 'delta' | 'complete'

  /**
   * If the type is "delta", this field contains the text delta of the stream.
   */
  textDelta?: string

  /**
   * If the type is "complete", this field contains the complete text of the stream.
   */
  text?: string
}

export type EnhanceRun = {
  stream: AsyncIterable<EnhancePromptStream>
  response(): Promise<{ text: string }>
}
