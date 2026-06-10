"use client"

import React, { useState } from "react"
import { ResumeData, ReferenceItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { ReferencesDialog } from "../dialogs/ReferencesDialog"

interface ReferencesEditorProps {
  data: NonNullable<ResumeData["sections"]>["references"] | undefined
  onChange: (data: any) => void
}

export const ReferencesEditor: React.FC<ReferencesEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: ReferenceItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: ReferenceItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      ...data,
      id: "references",
      name: data?.name || "References",
      visible: data?.visible ?? true,
      items: nextItems
    })
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    onChange({
      ...data,
      items: nextItems
    })
  }

  const handleToggleVisibility = (id: string) => {
    const nextItems = items.map((item) => {
        if (item.id === id) {
            return { ...item, visible: (item as any).visible === false ? true : false }
        }
        return item
    })
    onChange({
      ...data,
      items: nextItems
    })
  }

  const handleDuplicate = (item: ReferenceItem) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange({
      ...data,
      items: nextItems
    })
  }

  const handleReorder = (newItems: ReferenceItem[]) => {
    onChange({
      ...data,
      items: newItems
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          References
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Reference"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Reference"}
              subtitle={item.summary || item.email || "No details"}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <ReferencesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
