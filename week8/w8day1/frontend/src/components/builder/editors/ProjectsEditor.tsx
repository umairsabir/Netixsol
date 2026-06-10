"use client"

import React, { useState } from "react"
import { ResumeData, ProjectItem } from "@/lib/resume-schema"
import { SectionList } from "../shared/SectionList"
import { SectionItem } from "../shared/SectionItem"
import { ProjectsDialog } from "../dialogs/ProjectsDialog"

interface ProjectsEditorProps {
  data: NonNullable<ResumeData["sections"]>["projects"] | undefined
  onChange: (data: any) => void
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  data,
  onChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null)

  const items = data?.items || []

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: ProjectItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleSave = (item: ProjectItem) => {
    const nextItems = [...items]
    const index = nextItems.findIndex((i) => i.id === item.id)

    if (index > -1) {
      nextItems[index] = item
    } else {
      nextItems.push(item)
    }

    onChange({
      ...data,
      id: "projects",
      name: data?.name || "Projects",
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

  const handleDuplicate = (item: ProjectItem) => {
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

  const handleReorder = (newItems: ProjectItem[]) => {
    onChange({
      ...data,
      items: newItems
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Projects
        </h3>
        
        <SectionList 
            values={items} 
            onReorder={handleReorder} 
            onAdd={handleAdd} 
            addLabel="Add Project"
        >
          {items.map((item) => (
            <SectionItem
              key={item.id}
              value={item}
              title={item.name || "Untitled Project"}
              subtitle={item.description || "No description"}
              visible={(item as any).visible !== false}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleVisibility={() => handleToggleVisibility(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ))}
        </SectionList>
      </div>

      <ProjectsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  )
}
