'use client'

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Page, Payment } from 'better-auth-asaas/types'
import type { UseQueryResult } from '@tanstack/react-query'

import { PaymentQrButton } from '@/components/payment-qr-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type PaymentsTableProps = {
  payments: UseQueryResult<Page<Payment>, Error>
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const columns = useMemo<ColumnDef<Payment, unknown>[]>(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'value', header: 'Value' },
    { accessorKey: 'dueDate', header: 'Due date' },
    { accessorKey: 'billingType', header: 'Billing type' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <PaymentQrButton id={row.original.id} />,
    },
  ], [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: payments.data?.data ?? [],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {payments.isPending && (
          <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
        )}

        {payments.isError && (
          <TableRow><TableCell colSpan={6} className="text-destructive">{String(payments.error)}</TableCell></TableRow>
        )}

        {!payments.isPending && !payments.isError && (
          <>
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No payments</TableCell>
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
