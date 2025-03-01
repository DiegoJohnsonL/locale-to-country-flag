import { DataTable } from "./data-table"
import { columns } from "./columns"
import { getData } from "@/app/api/ley/service"

export default async function ProyectosDeLeyPage() {
  // Use the getData service to fetch the projects data
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Proyectos de Ley del Perú</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 