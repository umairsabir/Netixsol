"use client"

import React, { useState } from "react"
import { ResumeData, CustomSection } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { CustomSectionsDialog } from "../dialogs/CustomSectionsDialog"

interface CustomSectionsEditorProps {
  data: ResumeData["customSections"]
  onChange: (data: any) => void
}

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomSection | null>(null)

  const items = data || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: CustomSection) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: CustomSection) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange(nextItems)
  }

  const handleDelete = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    onChange(nextItems)
  }

  const handleToggleVisibility = (id: string) => {
    const nextItems = items.map((item) => {
        if (item.id === id) {
            return { ...item, visible: item.visible === false ? true : false }
        }
        return item
    })
    onChange(nextItems)
  }

  const handleDuplicate = (item: CustomSection) => {
    const newItem = {
        ...item,
        id: crypto.randomUUID(),
        name: `${item.name} (Copy)`
    }
    const nextItems = [...items, newItem]
    onChange(nextItems)
  }

  const handleReorder = (newItems: CustomSection[]) => {
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Custom Sections
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Custom Section"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Section"}
              subtitle="Custom Content"
              visible={item.visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <CustomSectionsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
