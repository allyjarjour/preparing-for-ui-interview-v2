import css from './gpt-chat.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMarkdownStream } from 'src/utilities/use-markdown-stream'
import { Markdown } from '../55-markdown/markdown.react'

/**
 * Expected behavior:
 * - Textarea + Send button to trigger streaming from /api/stream-markdown
 * - Chunks arrive via ReadableStream, queued and typed out char-by-char with requestAnimationFrame
 * - Rendered through a Markdown component
 * - Stop button to abort in-progress stream
 */

export const GPTComponent = () => {
  // Step 1: useMarkdownStream hook (define above or inline):
  //   - controllerRef for AbortController, inProgress state
  //   - stream(onChunk) — fetch with ReadableStream reader, decode chunks, call onChunk
  //   - abort() — controller.abort(), reset state
  const { stream, abort, inProgress } = useMarkdownStream()
  const [chunks, setChunks] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [content, setContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  function type(chunk: string) {
    if (chunk === '') {
      setIsTyping(false)
      return
    }

    if (chunk === '' && chunks.length > 0) {
      const clone = [...chunks]
      const newChunk = clone.shift() ?? ''
      setChunks(clone)
      type(newChunk)
      return
    }
    const slice = chunk.slice(0, 3)
    setContent((prev) => prev + slice)
    requestAnimationFrame(() => type(chunk.slice(3)))
  }

  const handleSend = () => {
    stream((chunk) => {
      setChunks((prev) => [...prev, chunk])
    })
  }

  useEffect(() => {
    if (!isTyping && chunks.length > 0) {
      setIsTyping(true)
      const chunk = chunks[0]
      setChunks((prev) => prev.slice(1))
      type(chunk)
    }
  }, [chunks, isTyping])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [content])

  // Step 2: State — chunks[] queue, content string (accumulated typed text), isTyping flag, contentRef for scroll
  // Step 3: handleSend — reset content/chunks, call stream() with onChunk that pushes to chunks queue
  // Step 4: type(chunk) — recursive function using requestAnimationFrame:
  //   - Take 2 chars at a time, append to content
  //   - When chunk exhausted, set isTyping=false to trigger next chunk processing
  //   - Auto-scroll contentRef to bottom
  // Step 5: useEffect on [chunks, isTyping] — if not typing and chunks available, shift next chunk and type it
  // Step 6: Render:
  //   - Content section with <Markdown text={content} />
  //   - Textarea + conditional Send/Stop button based on inProgress
  return (
    <div className={css.chat}>
      <section className={css.chat__content} ref={containerRef}>
        <Markdown text={content} />
      </section>
      <section className={css.chat__controls}>
        <textarea rows={5} />
        <button onClick={inProgress ? abort : handleSend}>{inProgress ? 'Stop' : 'Send'}</button>
      </section>
    </div>
  )
}
