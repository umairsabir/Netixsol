"use client";

import React from "react";
import { ResumeData } from "@/lib/resume-schema";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { formatDistance } from "date-fns";

// Fixed import for Card components since I created them in src/components/ui/card.tsx
import { 
  Card as UICard, 
  CardHeader as UICardHeader, 
  CardTitle as UICardTitle, 
  CardContent as UICardContent, 
  CardFooter as UICardFooter 
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumeCardProps {
  resume: ResumeData;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDelete,
  onDuplicate,
}) => {
  const lastUpdated = resume.metadata?.updatedAt 
    ? new Date(resume.metadata.updatedAt) 
    : new Date();

  return (
    <UICard className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 glass-card border-none ring-1 ring-border/50">
      <UICardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate?.(resume.id)} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(resume.id)} className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </UICardHeader>
      
      <UICardContent className="p-4 pt-2">
        <UICardTitle className="text-lg font-bold truncate">
          {resume.basics?.name || "Untitled Resume"}
        </UICardTitle>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {resume.basics?.label || "No title defined"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold">
           Updated {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
        </p>
      </UICardContent>

      <UICardFooter className="p-4 pt-0 gap-2">
        <Link href={`/resume/${resume.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full gap-2">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        </Link>
        <Button 
            variant="outline" 
            size="sm" 
            className="w-10 px-0" 
            onClick={() => onDelete?.(resume.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </UICardFooter>
    </UICard>
  );
};
