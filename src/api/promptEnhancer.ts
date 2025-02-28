import { Api } from './api'
import { parseError } from './error'

export type PromptEnhancerArgs = {
  text: string
  image: string
}

async function enhancePrompt({ text, image }: PromptEnhancerArgs): Promise<string> {
  try {
    const { data } = await Api.post('/prompt/enhance', {
      text,
      image
    })
    return Promise.resolve(data)
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { enhancePrompt }
