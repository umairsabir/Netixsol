"use client"

import React, { useState } from "react"
import { ResumeData, SkillItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { SkillDialog } from "../dialogs/SkillDialog"

interface SkillEditorProps {
  data: NonNullable<ResumeData["sections"]>["skills"] | undefined
  onChange: (data: NonNullable<NonNullable<ResumeData["sections"]>["skills"]>) => void
}

export const SkillEditor: React.FC<SkillEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SkillItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: SkillItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: SkillItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      id: data?.id || "skills",
      name: data?.name || "Skills",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    onChange({
      id: data?.id || "skills",
      name: data?.name || "Skills",
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
      id: data?.id || "skills",
      name: data?.name || "Skills",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleDuplicate = (item: SkillItem) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange({
      id: data?.id || "skills",
      name: data?.name || "Skills",
      visible: data?.visible ?? true,
      items: nextItems
    } as any)
  }

  const handleReorder = (newItems: SkillItem[]) => {
    onChange({
      id: data?.id || "skills",
      name: data?.name || "Skills",
      visible: data?.visible ?? true,
      items: newItems
    } as any)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Skills
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Skill"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Skill"}
              subtitle={item.level}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <SkillDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
