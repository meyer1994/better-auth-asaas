'use client'

import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type AsyncDataProps<TQueryFnData, TError = unknown, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKey: QueryKey
  queryFn: () => Promise<TQueryFnData>
  loading?: ReactNode
  error?: (err: TError) => ReactNode
  children: (query: UseQueryResult<TData, TError>) => ReactNode
}

export function AsyncData<TQueryFnData, TError = unknown, TData = TQueryFnData>({
  loading,
  error,
  children,
  ...queryOptions
}: AsyncDataProps<TQueryFnData, TError, TData>) {
  const query = useQuery(queryOptions)

  if (query.isPending) return <>{loading ?? <p className="text-sm text-muted-foreground">Loading...</p>}</>
  if (query.isError) return <>{error ? error(query.error) : <p className="text-sm text-destructive">Error: {String(query.error)}</p>}</>
  if (query.data === undefined) return null

  return <>{children(query)}</>
}
