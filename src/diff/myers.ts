import { type Change, diffLines } from 'diff'
import type { DiffLine } from './types'

export function convertMyersChangeToDiffLines(change: Change): DiffLine[] {
  const type: DiffLine['type'] = change.added
    ? 'new'
    : change.removed
      ? 'old'
      : 'same'
  const lines = change.value.split('\n')

  // `diff` package is always adding an extra new line at the end of the array
  if (lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.map(line => ({ type, line }))
}

export function myersDiff(oldContent: string, newContent: string): DiffLine[] {
  const theirFormat = diffLines(oldContent, newContent)
  const ourFormat = theirFormat.flatMap(convertMyersChangeToDiffLines)

  return ourFormat
}

export async function* createDiffStream(
  diffLines: DiffLine[]
): AsyncGenerator<DiffLine> {
  for (const diffLine of diffLines) {
    yield diffLine
  }
}
