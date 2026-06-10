"use client"

import React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reorder } from "framer-motion"

interface SectionListProps<T> {
  children: React.ReactNode
  values: T[]
  onReorder: (values: T[]) => void
  onAdd: () => void
  addLabel?: string
}

export function SectionList<T extends { id: string }>({
  children,
  values,
  onReorder,
  onAdd,
  addLabel = "Add Item",
}: SectionListProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <Reorder.Group 
        axis="y" 
        values={values} 
        onReorder={onReorder}
        className="flex flex-col gap-1"
      >
        {children}
      </Reorder.Group>
      
      <Button 
        variant="ghost" 
        onClick={onAdd}
        className="mt-2 w-full border-dashed border-2 h-12 rounded-xl group hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <Plus className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" />
        <span className="text-muted-foreground group-hover:text-primary">{addLabel}</span>
      </Button>
    </div>
  )
}
