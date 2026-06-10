"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PublicationItemSchema, PublicationItem } from "@/lib/resume-schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PublicationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: PublicationItem) => void
  initialData?: PublicationItem | null
}

export const PublicationsDialog: React.FC<PublicationsDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PublicationItem>({
    resolver: zodResolver(PublicationItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        publisher: "",
        releaseDate: "",
        url: "",
        summary: "",
      })
    }
  }, [open, initialData, reset])

  const onSubmit = (data: PublicationItem) => {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Publication" : "Add Publication"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Publication Title</Label>
              <Input id="name" {...register("name")} placeholder="e.g. The Art of Computer Programming" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" {...register("publisher")} placeholder="e.g. Addison-Wesley" />
              {errors.publisher && <p className="text-xs text-destructive">{errors.publisher.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input id="releaseDate" {...register("releaseDate")} placeholder="e.g. Oct 2023" />
              {errors.releaseDate && <p className="text-xs text-destructive">{errors.releaseDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" {...register("url")} placeholder="e.g. https://example.com" />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Description</Label>
            <Textarea 
                id="summary" 
                {...register("summary")} 
                placeholder="Briefly describe the publication..."
                className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
