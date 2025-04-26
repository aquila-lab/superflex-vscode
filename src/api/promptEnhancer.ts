import { checkRequestBodySize } from 'src/common/files'
import type { EnhanceRun, MessageContent } from '../../shared/model'
import { Api } from './api'
import { ApiError, parseError } from './error'
import { buildPromptEnhancementRequest } from './transformers'

export type EnhancePromptArgs = {
  threadID: string
  message: MessageContent
  options: {
    signal: AbortSignal
  }
}

async function enhancePrompt({
  threadID,
  message,
  options
}: EnhancePromptArgs): Promise<EnhanceRun> {
  try {
    const reqBody = buildPromptEnhancementRequest(threadID, message)
    checkRequestBodySize(reqBody)
    const response = await Api.post('/prompt/enhance', reqBody, {
      headers: { 'x-is-stream': 'true' },
      responseType: 'stream',
      signal: options.signal
    })

    const messages: string[] = []
    let streamError: Error | null = null

    const streamGenerator = (async function* () {
      let buffer = ''

      for await (const chunk of response.data) {
        try {
          // Convert chunk to string and append to existing buffer
          buffer += chunk.toString()

          // Process buffer as long as we can find complete JSON objects
          while (true) {
            // Find the first complete JSON object
            const openBraceIndex = buffer.indexOf('{')
            if (openBraceIndex === -1) {
              break // No JSON object starts, keep buffer
            }

            // Find matching closing brace by counting braces
            let braceCount = 0
            let closeBraceIndex = -1
            let inString = false
            let escapeNext = false

            for (let i = openBraceIndex; i < buffer.length; i++) {
              const char = buffer[i]

              if (escapeNext) {
                escapeNext = false
                continue
              }

              if (char === '\\') {
                escapeNext = true
                continue
              }

              if (char === '"') {
                inString = !inString
                continue
              }

              if (!inString) {
                if (char === '{') {
                  braceCount++
                }
                if (char === '}') {
                  braceCount--
                }
                if (braceCount === 0) {
                  closeBraceIndex = i
                  break
                }
              }
            }

            if (closeBraceIndex === -1) {
              break // No complete JSON object yet, keep buffer
            }

            // Extract the potential JSON string
            const jsonStr = buffer.slice(openBraceIndex, closeBraceIndex + 1)

            try {
              const data = JSON.parse(jsonStr)

              if (data.error) {
                throw new ApiError(
                  data.error.statusCode,
                  data.error.slug,
                  data.error.message
                )
              }

              // Handle complete message with nested structure
              if (data.is_complete && data.message) {
                messages.push(data.message)
                yield { type: 'complete' as const, text: data.message.text }
              }
              // Handle delta update
              else if (data.text_delta !== undefined) {
                yield { type: 'delta' as const, textDelta: data.text_delta }
              }

              // Remove processed JSON from buffer
              buffer = buffer.slice(closeBraceIndex + 1)
            } catch (err) {
              if (err instanceof ApiError) {
                throw err
              }
              // If parsing fails, it might be incomplete. Keep in buffer.
              break
            }
          }
        } catch (err) {
          streamError = err as Error
          throw err
        }
      }

      // Handle any remaining buffer data at end of stream
      if (buffer.length > 0) {
        try {
          const data = JSON.parse(buffer)
          if (data.is_complete && data.message) {
            messages.push(data.message)
            yield { type: 'complete' as const, text: data.message.text }
          }
        } catch (_) {
          // Ignore parsing errors for final buffer
        }
      }
    })()

    return {
      stream: streamGenerator,

      async response(): Promise<{ text: string }> {
        // Wait for all chunks to be processed by consuming the stream
        for await (const _ of streamGenerator) {
          // Consume the iterator
        }

        if (streamError) {
          throw streamError
        }

        return {
          text: messages.join('')
        }
      }
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return Promise.reject(err)
    }
    if (err instanceof Error && err.message === 'canceled') {
      return Promise.reject(err)
    }
    return Promise.reject(parseError(err))
  }
}

export { enhancePrompt }
