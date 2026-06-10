"use client"

import React, { useRef } from "react"
import { ResumeData } from "@/lib/resume-schema"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Upload, Trash2, Image as ImageIcon } from "lucide-react"

interface PictureEditorProps {
  picture: ResumeData["picture"] | undefined
  onChange: (picture: any) => void
}

export const PictureEditor: React.FC<PictureEditorProps> = ({
  picture,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pictureUrl = picture?.url || ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size too large. Please select an image smaller than 1MB.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({
          ...(picture || {}),
          url: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onChange({
      ...(picture || {}),
      url: ""
    })
    if (fileInputRef.current) {
        fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Profile Picture
        </h3>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden relative">
              {pictureUrl ? (
                <img src={pictureUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            {pictureUrl && (
              <button 
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Photo
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              JPG, PNG or GIF. Max 1MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
