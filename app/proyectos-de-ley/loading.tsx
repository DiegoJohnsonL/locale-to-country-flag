import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Proyectos de Ley del Perú</h1>
      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <div className="rounded-md border">
          <div className="h-[500px] w-full relative">
            <Skeleton className="absolute inset-0" />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      </div>
    </div>
  )
} 