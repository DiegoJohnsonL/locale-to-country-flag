"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Updated to match the structure from the service
export type ProyectoDeLey = {
  numero: string
  titulo: string
  fechaPresentacion: string
  periodo: string
  legislatura: string
  proponente: string
  sumilla: string
  autor: string
  coautores: string[]
  grupoParliamentario: string
  estado: string
  urlOriginal: string
}

export const columns: ColumnDef<ProyectoDeLey>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "numero",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Número
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "fechaPresentacion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Presentación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words">
        {row.getValue("titulo")}
      </div>
    ),
  },
  {
    accessorKey: "proponente",
    header: "Proponente",
  },
  {
    accessorKey: "autor",
    header: "Autor Principal",
  },
  {
    accessorKey: "sumilla",
    header: "Resumen",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words">
        {row.getValue("sumilla")}
      </div>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    id: "enlaces",
    header: "Enlaces",
    cell: ({ row }) => {
      const proyecto = row.original
      
      return (
        <div className="flex space-x-2">
          <Link 
            href={proyecto.urlOriginal} 
            target="_blank"
            className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 rounded-md"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Ver proyecto</span>
          </Link>
        </div>
      )
    },
  },
] 