"use client"

import React from "react"
import { MoreVertical, Trash2, Edit2, Eye, EyeOff, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Reorder, useDragControls } from "framer-motion"

interface SectionItemProps {
  value: any // The full item object for Reorder.Item
  title: string
  subtitle?: string
  visible?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleVisibility?: () => void
  onDuplicate?: () => void
}

export const SectionItem: React.FC<SectionItemProps> = ({
  value,
  title,
  subtitle,
  visible = true,
  onEdit,
  onDelete,
  onToggleVisibility,
  onDuplicate,
}) => {
  const controls = useDragControls()

  return (
    <Reorder.Item 
      value={value}
      dragListener={false}
      dragControls={controls}
      // Removed transition-all to prevent stuttering during drag
      className={cn(
        "group flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm select-none",
        !visible && "opacity-50"
      )}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        backgroundColor: "hsl(var(--background))"
      }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="cursor-grab active:cursor-grabbing p-2 -ml-1 opacity-30 group-hover:opacity-100 transition-opacity touch-none"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 pointer-events-auto" onClick={onEdit}>
        <h4 className="font-semibold text-sm truncate cursor-pointer">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground truncate cursor-pointer">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleVisibility}>
          {!visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
                Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Reorder.Item>
  )
}
