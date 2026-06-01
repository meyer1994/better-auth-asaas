'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type Props<T> = {
  query: UseQueryResult<T, unknown>
  loading?: ReactNode
  error?: (err: unknown) => ReactNode
  children: (data: T) => ReactNode
}

export function AsyncData<T>({ query, loading, error, children }: Props<T>) {
  if (query.isPending) return <>{loading ?? <p className="text-sm text-muted-foreground">Loading…</p>}</>
  if (query.isError) return <>{error ? error(query.error) : <p className="text-sm text-destructive">Error: {String(query.error)}</p>}</>
  if (query.data === undefined) return null
  return <>{children(query.data)}</>
}
