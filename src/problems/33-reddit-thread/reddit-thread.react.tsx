import css from './reddit-thread.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

export interface IRedditComment {
  id: string
  nickname: string
  text: string
  date: string
  replies: IRedditComment[]
}

/**
 * Expected data sample:
 * {
 *   comments: [
 *     {
 *       id: "1",
 *       nickname: "user123",
 *       text: "This is a top-level comment",
 *       date: "2024-01-15",
 *       replies: [
 *         {
 *           id: "2",
 *           nickname: "replier456",
 *           text: "This is a nested reply",
 *           date: "2024-01-16",
 *           replies: []
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Step 1: Create a RedditComment component that renders a single comment
 * - Render an <article> with css.comment and flex.padding16
 * - <header> with flex.flexRowBetween: <strong> for nickname, <time> for date
 * - <p> for comment text with padding classes
 *
 * Step 2: Handle nested replies recursively
 * - If comment.replies.length > 0, render a <details>/<summary> toggle
 * - Inside <details>, render a <ul> with each reply as a <li>
 * - Recursively render <RedditComment> for each reply
 *
 * Step 3: Create RedditThreadComponent that maps over top-level comments
 * - Wrap in a container div with css.container and flex.wh100
 * - Map over comments array, rendering <RedditComment> for each
 */
export const RedditThread = ({ comments }: { comments: IRedditComment[] }) => {
  return (
    <div className={cx(css.container, flex.wh100)}>
      {comments.map((comment) => (
        <RedditComment key={comment.id} {...comment} />
      ))}
    </div>
  )
}

function RedditComment({ id: _id, replies, text, nickname, date }: IRedditComment) {
  return (
    <article className={cx(css.comment, flex.padding16)}>
      <header className={cx(flex.flexRowBetween)}>
        <strong>{nickname}</strong>
        <time>{date}</time>
        <p>{text}</p>
      </header>
      {replies.length > 0 && (
        <details>
          <summary className={css.cursorPointer}>Replies</summary>
          <ul className={cx(flex.paddingLeft16, css.repliesList)}>
            {replies.map((reply) => {
              return (
                <li key={reply.id}>
                  <RedditComment {...reply} />
                </li>
              )
            })}
          </ul>
        </details>
      )}
    </article>
  )
}
