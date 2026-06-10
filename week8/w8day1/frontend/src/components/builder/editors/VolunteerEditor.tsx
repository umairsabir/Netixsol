"use client"

import React, { useState } from "react"
import { ResumeData, VolunteerItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { VolunteerDialog } from "../dialogs/VolunteerDialog"

interface VolunteerEditorProps {
  data: NonNullable<ResumeData["sections"]>["volunteer"] | undefined
  onChange: (data: any) => void
}

export const VolunteerEditor: React.FC<VolunteerEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<VolunteerItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: VolunteerItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: VolunteerItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      ...data,
      id: "volunteer",
      name: data?.name || "Volunteer",
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

  const handleDuplicate = (item: VolunteerItem) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        organization: `${item.organization} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange({
      ...data,
      items: nextItems
    })
  }

  const handleReorder = (newItems: VolunteerItem[]) => {
    onChange({
      ...data,
      items: newItems
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Volunteer Experience
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Volunteer Experience"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.position || "Untitled Position"}
              subtitle={item.organization || "No organization"}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <VolunteerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
