# Next.js Resume Builder Clone - Implementation Plan

## Project Overview
Build a Next.js-based resume builder clone with localStorage-based data persistence, single MVP template, and PDF/Word export capabilities. Frontend-only implementation inspired by reactive-resume architecture.

## Stack & Technology Decisions

### State Management
- **TanStack Query (React Query)** - For managing resume data with localStorage persistence
- **Custom localStorage hook** - Synchronize data to localStorage on every change
- **Alternative**: Can migrate to Zustand if TanStack Query feels over-engineered

### Export Functionality
- **jsPDF + html2canvas** - Client-side PDF generation with good styling support
- **docx library** - Client-side Word document generation (same as reactive-resume)

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library (Button, Input, Dialog, etc.)
- **CSS Variables** - For resume-specific styling (fonts, colors, page dimensions)

### Other Libraries
- **React Hook Form** - Form management for content editors
- **TipTap** - Rich text editor for HTML content (experience descriptions, summaries)
- **react-dnd** - Drag & drop for section reordering
- **zustand** - Lightweight temporal store for undo/redo (optional but recommended)
- **zod** - Schema validation (borrowed from reactive-resume)

---

## Data Schema Design

### Core ResumeData Structure
```
ResumeData
├── picture (profile photo settings)
├── basics (name, email, phone, location, website, custom fields)
├── summary (title, content, columns, hidden)
├── sections
│   ├── profiles (social media links)
│   ├── experience (jobs with nested roles)
│   ├── education (schools/degrees)
│   ├── projects (portfolio projects)
│   ├── skills (with proficiency levels)
│   ├── languages (with fluency levels)
│   ├── interests
│   ├── awards
│   ├── certifications
│   ├── publications
│   ├── volunteer
│   └── references
├── customSections (user-defined sections)
└── metadata
    ├── template (single MVP template name)
    ├── layout (sidebar width, page layouts)
    ├── design (colors, fonts, spacing)
    ├── typography (font families, sizes)
    ├── page (A4/Letter/Free-form dimensions)
    ├── css (custom user CSS, sanitized)
    └── notes (internal notes)
```

### Default Sample Data
Create a complete default resume with sample data matching reactive-resume's structure for user reference.

---

## MVP Template Strategy

### Single Template (MVP Phase)
- **Name**: Start with "Modern" or "Classic" template
- **Layout**: Two-column layout (sidebar + main content)
- **Features**:
  - Profile picture
  - Basic contact info header
  - Color-customizable sidebar
  - Section-based content rendering
  - Configurable sidebar width
  - Print-friendly design

### Future Expansion
- Structure code to make adding more templates easy
- Each template = isolated React component receiving standardized props
- Template registry pattern similar to reactive-resume

---

## Component Architecture

### Directory Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (landing page with resume list)
│   ├── resume/
│   │   ├── [id]/
│   │   │   └── page.tsx (builder main page)
│   │   └── new/
│   │       └── page.tsx (create new resume)
├── components/
│   ├── builder/
│   │   ├── BuilderLayout.tsx (3-panel main layout)
│   │   ├── BuilderHeader.tsx (top navigation)
│   │   ├── BuilderDock.tsx (undo/redo/export buttons)
│   │   └── Sidebar/
│   │       ├── Left/ (content editing)
│   │       │   ├── BasicsSections.tsx
│   │       │   ├── PictureSection.tsx
│   │       │   ├── SummarySection.tsx
│   │       │   ├── ExperienceSection.tsx
│   │       │   └── ... (other sections)
│   │       └── Right/ (settings)
│   │           ├── TemplateSection.tsx
│   │           ├── LayoutSection.tsx
│   │           ├── DesignSection.tsx
│   │           ├── TypographySection.tsx
│   │           └── ExportSection.tsx
│   ├── resume/
│   │   ├── ResumePreview.tsx (main preview component)
│   │   ├── templates/
│   │   │   └── ModernTemplate.tsx (single MVP template)
│   │   ├── shared/
│   │   │   ├── PageSection.tsx (generic section renderer)
│   │   │   ├── PagePicture.tsx
│   │   │   ├── PageLink.tsx
│   │   │   └── items/
│   │   │       ├── ExperienceItem.tsx
│   │   │       ├── EducationItem.tsx
│   │   │       └── ... (other item components)
│   ├── editors/
│   │   ├── RichTextEditor.tsx (TipTap-based)
│   │   ├── SectionEditor.tsx
│   │   └── FormField.tsx (wrapper for React Hook Form)
│   └── ui/
│       └── (shadcn/ui components like Button, Input, Dialog, etc.)
├── hooks/
│   ├── useResume.ts (TanStack Query hook)
│   ├── useResumeLocalStorage.ts (localStorage sync)
│   ├── useTemporalStore.ts (undo/redo)
│   └── useExport.ts (PDF/Word export)
├── lib/
│   ├── resume-schema.ts (Zod schemas for validation)
│   ├── resume-defaults.ts (default sample data)
│   ├── export/
│   │   ├── pdf.ts (jsPDF + html2canvas)
│   │   └── docx.ts (docx library)
│   ├── utils.ts (helper functions)
│   └── storage.ts (localStorage utility functions)
└── styles/
    ├── globals.css
    └── resume.module.css (resume-specific styling)
```

### Key Components Breakdown

#### 1. Builder Layout Components
- **BuilderLayout**: 3-panel resizable layout (left sidebar, center preview, right sidebar)
- **BuilderHeader**: Top navigation, resume name, menu
- **BuilderDock**: Bottom floating dock with undo/redo, zoom, export buttons
- **ResizablePanel**: Draggable panel separators (use `react-resizable-panels`)

#### 2. Content Editors (Left Sidebar)
- Edit basics, picture, summary, and each resume section
- Use React Hook Form for form state management
- Integrate TipTap for rich text descriptions
- Drag-and-drop to reorder sections/items

#### 3. Settings Editors (Right Sidebar)
- Template selection dropdown
- Layout editor (sidebar width slider, page management)
- Design customization (colors, spacing)
- Typography settings (fonts, sizes)
- Export buttons

#### 4. Resume Preview (Center)
- Live preview of the resume
- Zoom controls (using `react-zoom-pan-pinch` or similar)
- Render selected template
- Respond to all data changes in real-time

#### 5. Template Component
- Modern template as React component
- Props: `resume data, template settings, className`
- Render sections dynamically based on layout config
- Apply CSS variables for theming

---

## Data Flow & State Management

### Resume Data Lifecycle

1. **Load Resume**
   - Fetch from localStorage via TanStack Query
   - Initialize with defaults if new resume

2. **Edit Resume**
   - Update via TanStack Query mutation
   - Trigger local state update
   - Auto-save to localStorage

3. **Undo/Redo**
   - Maintain temporal store of resume states
   - TanStack Query + custom temporal middleware

4. **Export**
   - Serialize resume data to structured format
   - Render HTML from template
   - Generate PDF (jsPDF) or DOCX (docx library)

### TanStack Query Integration
```typescript
// Example hook
useResume(resumeId) {
  return useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => localStorage.getItem(`resume_${resumeId}`),
    enabled: !!resumeId,
  })
}

// Example mutation
useMutationUpdateResume() {
  return useMutation({
    mutationFn: (data) => {
      localStorage.setItem(`resume_${id}`, JSON.stringify(data))
      return data
    }
  })
}
```

---

## Export Implementation

### PDF Export (jsPDF + html2canvas)
1. Render resume preview to HTML
2. Capture HTML as canvas using html2canvas
3. Convert canvas to image using jsPDF
4. Handle multi-page PDFs by calculating page breaks
5. Download file with filename

### Word Export (docx library)
1. Build Document object from resume data
2. Set page size, margins, fonts from metadata
3. Render sections as Paragraphs with TextRun formatting
4. Handle tables for two-column layouts
5. Convert HTML to DOCX (TipTap HTML → docx TextRuns)
6. Pack and download as BLOB

---

## Development Phases

### Phase 1: Core Data Structure & Schema
- Define Zod schemas for all resume data
- Create default sample resume
- Set up localStorage utilities
- Create custom React hooks for data access

### Phase 2: Builder UI Layout
- Create 3-panel builder layout with resizable panels
- Build header and dock components
- Set up basic navigation and menu

### Phase 3: Content Editors (Left Sidebar)
- Implement Basics editor (name, email, phone, etc.)
- Implement Picture uploader
- Implement Summary editor with TipTap
- Implement section editors for each resume section
- Add drag-and-drop reordering (react-dnd)

### Phase 4: Settings Editors (Right Sidebar)
- Template selection
- Layout customization (sidebar width)
- Design customization (colors, spacing)
- Typography selection

### Phase 5: Resume Preview & Templates
- Build Modern template component
- Create resume preview with zoom controls
- Implement live styling with CSS variables
- Test responsive design and print layout

### Phase 6: Export Functionality
- Implement PDF export (jsPDF + html2canvas)
- Implement Word export (docx library)
- Add export buttons to dock

### Phase 7: Undo/Redo & Polish
- Implement temporal state management
- Add undo/redo buttons
- Testing and refinement

### Phase 8: Landing Page & Resume Management
- Create resume list page
- Add create/duplicate/delete resume functionality
- Basic resume metadata display

---

## Key Libraries to Install

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "@tiptap/react": "^2.0.0",
    "@tiptap/starter-kit": "^2.0.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0",
    "docx": "^8.0.0",
    "react-dnd": "^16.0.0",
    "react-dnd-html5-backend": "^16.0.0",
    "react-zoom-pan-pinch": "^3.0.0",
    "react-resizable-panels": "^0.0.0",
    "tailwindcss": "^3.0.0",
    "shadcn-ui": "^0.0.0",
    "zod": "^3.0.0"
  }
}
```

---

## Critical Success Factors

1. **Responsive UI** - Preview should zoom/pan smoothly
2. **Real-time Sync** - Changes immediately reflect in preview
3. **localStorage Reliability** - Data persists across sessions
4. **Export Quality** - PDF and DOCX should match preview appearance
5. **Rich Text Support** - TipTap for professional descriptions
6. **Easy Template Addition** - Structure for adding more templates later

---

## Future Enhancements

1. Add more templates (currently 1 MVP, plan for 13 total)
2. Add multi-page resume support
3. Add custom CSS editor
4. Add color picker for design customization
5. Add preset color schemes
6. Add page/margin customization
7. Add section visibility toggling
8. Add import from JSON/previous exports
9. Add collaboration features (optional)
10. Add cloud sync (optional)

---

## Notes

- **No Backend Required** - Everything runs in browser with localStorage
- **TanStack Query** - Provides good caching and state management with localStorage sync
- **Template Expansion** - Code designed to easily add 12 more templates in Phase 8+
- **Styling Strategy** - CSS variables for dynamic theming + Tailwind for layout
- **Export Method** - Client-side generation avoids server complexity (no Puppeteer needed)
