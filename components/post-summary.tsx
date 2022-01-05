import { AuthorWithDate } from '@/components/author-with-date'
import { Banner } from '@/components/banner'
import { ButtonLink } from '@/components/button-link'
import { HtmlView } from '@/components/html-view'
import { ChevronRightIcon, MessageIcon } from '@/components/icons'
import { LikeButton } from '@/components/like-button'
import { classNames } from '@/lib/classnames'
import { InferQueryOutput } from '@/lib/trpc'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Link from 'next/link'
import * as React from 'react'

export type PostSummaryProps = {
  post: InferQueryOutput<'post.feed'>['posts'][number]
  hideAuthor?: boolean
  onLike: () => void
  onUnlike: () => void
}

export function PostSummary({
  post,
  hideAuthor = false,
  onLike,
  onUnlike,
}: PostSummaryProps) {
  const contentDocument = React.useMemo(
    () => new DOMParser().parseFromString(post.contentHtml, 'text/html'),
    [post.contentHtml]
  )
  //   TODO: decide on the order of the allowed tags
  //   and research on how to truncate html to a max amount of characters
  const summary = React.useMemo(() => {
    const allowedTags = ['p', 'ul', 'ol', 'h3', 'pre', 'img']

    for (const tag of allowedTags) {
      const element = contentDocument.body.querySelector(tag)
      if (element) {
        return element.outerHTML
      }
    }

    return "<p>Summary couldn't be generated</p>"
  }, [contentDocument])
  const hasMoreContent = React.useMemo(
    () => contentDocument.body.children.length > 1,
    [contentDocument]
  )

  const isLiked = post.likedBy.length === 1

  return (
    <div>
      {post.hidden && (
        <Banner className="mb-6">
          This post has been hidden and is only visible to administrators.
        </Banner>
      )}
      <div className={classNames(post.hidden ? 'opacity-50' : '')}>
        <Link href={`/post/${post.id}`}>
          <a>
            <h2 className="text-2xl font-bold tracking-tight">{post.title}</h2>
          </a>
        </Link>

        <div
          className={classNames(
            'flex items-center justify-between gap-4',
            hideAuthor ? 'mt-2' : 'mt-6'
          )}
        >
          {hideAuthor ? (
            <p className="tracking-tight text-secondary">
              <time dateTime={post.createdAt.toISOString()}>
                {formatDistanceToNow(post.createdAt)}
              </time>{' '}
              ago
            </p>
          ) : (
            <AuthorWithDate author={post.author} date={post.createdAt} />
          )}

          <div className="flex gap-2 md:gap-4">
            <LikeButton
              isLiked={isLiked}
              likeCount={post._count.likedBy}
              responsive
              onLike={onLike}
              onUnlike={onUnlike}
            />

            <ButtonLink
              href={`/post/${post.id}#comments`}
              variant="secondary"
              responsive
            >
              <MessageIcon className="w-4 h-4 text-secondary" />
              <span className="ml-1.5">{post._count.comments}</span>
            </ButtonLink>
          </div>
        </div>

        <HtmlView html={summary} className={hideAuthor ? 'mt-4' : 'mt-6'} />

        {hasMoreContent && (
          <div className="mt-4">
            <Link href={`/post/${post.id}`}>
              <a className="inline-flex items-center font-medium transition-colors text-blue hover:text-blue-dark">
                Continue reading <ChevronRightIcon className="w-4 h-4 ml-1" />
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}