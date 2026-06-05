'use client'

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Page, Subscription } from 'better-auth-asaas/types'
import type { UseQueryResult } from '@tanstack/react-query'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Props = {
  subscriptions: UseQueryResult<Page<Subscription>, Error>
}

export function SubscriptionsTable({ subscriptions }: Props) {
  const columns = useMemo<ColumnDef<Subscription, unknown>[]>(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'value', header: 'Value' },
    { accessorKey: 'nextDueDate', header: 'Next due date' },
    { accessorKey: 'cycle', header: 'Cycle' },
    { accessorKey: 'billingType', header: 'Billing type' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'description', header: 'Description' },
  ], [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: subscriptions.data?.data || [],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {subscriptions.isPending && (
          <TableRow>
            <TableCell colSpan={7}>Loading...</TableCell>
          </TableRow>
        )}

        {subscriptions.isError && (
          <TableRow>
            <TableCell colSpan={7} className="text-destructive">
              {String(subscriptions.error)}
            </TableCell>
          </TableRow>
        )}

        {subscriptions.isSuccess && (
          <>
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No subscriptions</TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  )
}
