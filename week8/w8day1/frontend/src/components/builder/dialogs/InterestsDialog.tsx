"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InterestItemSchema, InterestItem } from "@/lib/resume-schema"
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
import { X, Plus } from "lucide-react"

interface InterestsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: InterestItem) => void
  initialData?: InterestItem | null
}

export const InterestsDialog: React.FC<InterestsDialogProps> = ({
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
  } = useForm<InterestItem>({
    resolver: zodResolver(InterestItemSchema),
    defaultValues: initialData || {
      id: crypto.randomUUID(),
      name: "",
      keywords: [],
    },
  })

  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || [])
  const [newKeyword, setNewKeyword] = useState("")

  useEffect(() => {
    if (open) {
      reset(initialData || {
        id: crypto.randomUUID(),
        name: "",
        keywords: [],
      })
      setKeywords(initialData?.keywords || [])
      setNewKeyword("")
    }
  }, [open, initialData, reset])

  const onSubmit = (data: InterestItem) => {
    onSave({ ...data, keywords })
    onOpenChange(false)
  }

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
        setKeywords([...keywords, newKeyword.trim()]);
        setNewKeyword("");
      }
    }
  };

  const removeKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter(kw => kw !== kwToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Interest" : "Add Interest"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Interest Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Open Source, Photography" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyword">Keywords</Label>
            <div className="flex gap-2">
                <Input 
                    id="keyword" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="e.g. React, Next.js (press Enter to add)" 
                />
                <Button type="button" variant="secondary" onClick={handleAddKeyword}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
                {keywords.map(kw => (
                    <div key={kw} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        {kw}
                        <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
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
