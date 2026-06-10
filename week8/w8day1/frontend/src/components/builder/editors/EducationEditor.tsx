"use client"

import React, { useState } from "react"
import { ResumeData, EducationItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { EducationDialog } from "../dialogs/EducationDialog"

interface EducationEditorProps {
  data: NonNullable<ResumeData["sections"]>["education"] | undefined
  onChange: (data: NonNullable<NonNullable<ResumeData["sections"]>["education"]>) => void
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: EducationItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: EducationItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      id: data?.id || "education",
      name: data?.name || "Education",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    onChange({
      id: data?.id || "education",
      name: data?.name || "Education",
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
      id: data?.id || "education",
      name: data?.name || "Education",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDuplicate = (item: EducationItem) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        institution: `${item.institution} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange({
      id: data?.id || "education",
      name: data?.name || "Education",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleReorder = (newItems: EducationItem[]) => {
    onChange({
      id: data?.id || "education",
      name: data?.name || "Education",
      visible: data?.visible ?? true,
      items: newItems
    } as any)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Education
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Education"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.institution || "Untitled Institution"}
              subtitle={`${item.studyType} in ${item.area}`}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <EducationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
