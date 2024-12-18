import { Raw } from '../nodes/raw'
import { Document } from '../nodes/document'
import { matchSubstring } from '../utils/string'
import { NormalizedPadMarkdownOptions } from '../transformers/pad-markdown-options'

type documentParser = (content: string, options: NormalizedPadMarkdownOptions) => Document

const cpp = createCStyleParser('//', ['/*', '*/'], [['"', '"']])
const javascript = createCStyleParser('//', ['/*', '*/'], [['"', '"'], ["'", "'"], ['`', '`']])
const sql = createCStyleParser('--', ['/*', '*/'], [['"', '"']])
const parsers = {
  cpp,
  'c++': cpp,
  c: cpp,
  java: cpp,
  javascript,
  js: javascript,
  csharp: cpp,
  'c#': cpp,
  typescript: javascript,
  ts: cpp,
  go: cpp,
  sql,
  bash: bash,
  shell: bash,
  sh: bash,
  python: bash,
  py: bash,
  ruby: bash
}

export function parseCode (code: string, lang: string, parseMarkdown: documentParser, options: NormalizedPadMarkdownOptions) {
  const parser = parsers[lang]
  if (!parser) {
    return [new Raw(code)]
  }
  return [...parser(code, parseMarkdown, options)]
}

function createCStyleParser (inlineCommentPrefix: string, delimitedComment: [string, string], traps: [string, string][]) {
  return function * cpp (code: string, parseMarkdown: documentParser, options: NormalizedPadMarkdownOptions) {
    let i = 0; let prevI = 0
    const N = code.length
    while (i < N) {
      // match inline comment first, example:
      // int foo = 1; // this is foo
      if (matchSubstring(code, i, inlineCommentPrefix)) {
        const j = code.indexOf('\n', i)
        const end = j === -1 ? N : j
        if (i + inlineCommentPrefix.length > prevI) {
          yield new Raw(code.slice(prevI, i + inlineCommentPrefix.length))
        }
        yield parseMarkdown(code.slice(i + inlineCommentPrefix.length, end), options)
        prevI = i = end
        continue
      }
      // match block comment, example:
      // int foo = 1; /* this is foo */
      const [prefix, suffix] = delimitedComment
      if (matchSubstring(code, i, prefix)) {
        const j = code.indexOf(suffix, i + prefix.length)
        const end = j === -1 ? N : j
        if (i + prefix.length > prevI) {
          yield new Raw(code.slice(prevI, i + prefix.length))
        }
        yield parseMarkdown(code.slice(i + prefix.length, end), options)
        prevI = i = end
        continue
      }
      // ignore traps, example:
      // string href = "http://example.com"
      for (const [prefix, suffix] of traps) {
        if (!matchSubstring(code, i, prefix)) continue
        const j = code.indexOf(suffix, i + prefix.length)
        const end = j === -1 ? N : j
        i = end
        continue
      }
      i++
    }
    if (prevI < N) {
      yield new Raw(code.slice(prevI, N))
    }
  }
}

function * bash (code: string, parseMarkdown: documentParser, options: NormalizedPadMarkdownOptions) {
  let i = 0; let prevI = 0
  const N = code.length
  while (i < N) {
    const c1 = code[i]
    if (c1 === '#') {
      const j = code.indexOf('\n', i)
      const end = j === -1 ? N : j
      if (i >= prevI) {
        yield new Raw(code.slice(prevI, i + 2))
      }
      yield parseMarkdown(code.slice(i + 2, end), options)
      prevI = i = end
    } else {
      i++
    }
  }
  if (prevI < N) {
    yield new Raw(code.slice(prevI, N))
  }
}
