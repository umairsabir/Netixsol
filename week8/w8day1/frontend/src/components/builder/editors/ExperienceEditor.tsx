"use client"

import React, { useState } from "react"
import { ResumeData, ExperienceItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { ExperienceDialog } from "../dialogs/ExperienceDialog"

interface ExperienceEditorProps {
  data: NonNullable<ResumeData["sections"]>["experience"] | undefined
  onChange: (data: NonNullable<NonNullable<ResumeData["sections"]>["experience"]>) => void
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: ExperienceItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: ExperienceItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      id: data?.id || "experience",
      name: data?.name || "Experience",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    onChange({
      id: data?.id || "experience",
      name: data?.name || "Experience",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleToggleVisibility = (id: string) => {
    const nextItems = items.map((item) => {
        if (item.id === id) {
            return { ...item, visible: !(item as any).visible }
        }
        return item
    })
    onChange({
      id: data?.id || "experience",
      name: data?.name || "Experience",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDuplicate = (item: ExperienceItem) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange({
      id: data?.id || "experience",
      name: data?.name || "Experience",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleReorder = (newItems: ExperienceItem[]) => {
    onChange({
      id: data?.id || "experience",
      name: data?.name || "Experience",
      visible: data?.visible ?? true,
      items: newItems
    } as any)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Experience
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Experience"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Company"}
              subtitle={item.position || "Untitled Position"}
              visible={item.visible}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <ExperienceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
