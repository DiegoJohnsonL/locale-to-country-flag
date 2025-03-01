import { DataTable } from "./data-table"
import { columns } from "./columns"
import { getData } from "@/app/api/ley/service"

export const dynamic = 'force-dynamic'
export const maxDuration = 60;

export default async function ProyectosDeLeyPage() {
  const data = await getData()
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Proyectos de Ley del Perú</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 