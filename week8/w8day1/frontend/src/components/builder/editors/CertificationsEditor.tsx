"use client"

import React, { useState } from "react"
import { ResumeData, CertificationItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { CertificationsDialog } from "../dialogs/CertificationsDialog"

interface CertificationsEditorProps {
  data: NonNullable<ResumeData["sections"]>["certifications"] | undefined
  onChange: (data: any) => void
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: CertificationItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: CertificationItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      ...data,
      id: "certifications",
      name: data?.name || "Certifications",
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

  const handleDuplicate = (item: CertificationItem) => {
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

  const handleReorder = (newItems: CertificationItem[]) => {
    onChange({
      ...data,
      items: newItems
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Certifications
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Certification"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Certificate"}
              subtitle={item.issuer || "No issuer"}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <CertificationsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
