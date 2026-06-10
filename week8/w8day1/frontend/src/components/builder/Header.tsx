"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Eye,
  FileJson,
  Plus,
  Save,
  Settings as SettingsIcon,
  Share2,
  Loader2,
  FileCode,
  FileText,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
  onTitleChange?: (title: string) => void;
  onExportPdf?: () => void;
  onExportDocx?: () => void;
  onExportJson?: () => void;
  isExporting?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  onExportPdf,
  onExportDocx,
  onExportJson,
  isExporting,
  className,
}) => {
  return (
    <header className={cn(
      "flex h-16 w-full items-center justify-between border-b px-4 glass z-50",
      className
    )}>
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="h-6 w-px bg-border mx-1 md:mx-2 shrink-0 hidden sm:block" />
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="bg-transparent text-base md:text-lg font-bold outline-none hover:bg-accent/50 focus:bg-accent px-2 py-1 rounded-md transition-colors truncate min-w-0 w-full max-w-[200px] md:max-w-none"
        />
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="gap-2 shadow-primary/20 shadow-lg min-w-0 sm:min-w-[100px] px-2 md:px-4"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPdf} className="gap-2">
              <FileText className="h-4 w-4 text-rose-500" />
              <span>Adobe PDF (.pdf)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDocx} className="gap-2">
              <File className="h-4 w-4 text-blue-500" />
              <span>Microsoft Word (.docx)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportJson} className="gap-2">
              <FileCode className="h-4 w-4 text-emerald-500" />
              <span>JSON Data (.json)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
