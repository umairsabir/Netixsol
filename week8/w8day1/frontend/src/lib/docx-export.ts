import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } from "docx";
import { ResumeData } from "./resume-schema";

/**
 * Strips HTML tags from a string to get plain text.
 * Used for TipTap rich text conversion to DOCX which needs TextRuns.
 */
const stripHtml = (html: string): string => {
    if (typeof window !== "undefined") {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }
    return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Sanitize filename: keep letters, digits, underscores, dashes.
 */
const sanitizeFilename = (name: string): string => {
    return name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
};

/**
 * Build a DOCX document from resume data.
 */
export const exportResumeToDocx = async (data: ResumeData, fullName: string = "Resume"): Promise<boolean> => {
    const { basics, sections } = data;
    const pictureUrl = data.picture?.url;

    /**
     * Converts a base64 data URL to a Uint8Array buffer for docx ImageRun.
     */
    const dataUrlToBuffer = (dataUrl: string): Uint8Array => {
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    };

    // Header Content
    const headerItems: Paragraph[] = [];

    // Profile picture if available
    if (pictureUrl && pictureUrl.startsWith("data:image")) {
        try {
            const imgBuffer = dataUrlToBuffer(pictureUrl);
            const mimeMatch = pictureUrl.match(/data:image\/(\w+);/);
            const rawType = mimeMatch?.[1]?.toLowerCase() || "jpeg";
            // docx ImageRun raster types: "jpg" | "png" | "gif" | "bmp"
            const imgType = (rawType === "jpeg" ? "jpg" : rawType) as "jpg" | "png" | "gif" | "bmp";
            headerItems.push(
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: imgBuffer,
                            transformation: { width: 70, height: 70 },
                            type: imgType,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                })
            );
        } catch (e) {
            console.warn("Could not embed profile picture in DOCX:", e);
        }
    }

    headerItems.push(
        new Paragraph({
            text: basics?.name || "Untitled",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: basics?.label || "",
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [
                new TextRun({ text: basics?.email ? `${basics.email} | ` : "" }),
                new TextRun({ text: basics?.phone ? `${basics.phone} | ` : "" }),
                new TextRun({ text: basics?.url ? `${basics.url} | ` : "" }),
                new TextRun({ text: basics?.location?.city ? `${basics.location.city}, ${basics.location.region}` : "" }),
            ],
            alignment: AlignmentType.CENTER,
        }),
    );

    // Summary Section
    if (basics?.summary) {
        headerItems.push(
            new Paragraph({
                text: "Summary",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }),
            new Paragraph({
                text: stripHtml(basics.summary),
            })
        );
    }

    // Experience Section
    if (sections?.experience?.items && sections.experience.items.length > 0) {
        headerItems.push(new Paragraph({
            text: sections.experience.name || "Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.experience.items.filter(i => i.visible !== false).forEach(item => {
            headerItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.position, bold: true }),
                        new TextRun({ text: ` at ${item.name}`, italics: true }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `${item.startDate} - ${item.isWorkingHere ? "Present" : item.endDate}` }),
                        new TextRun({ text: ` | ${item.location}` }),
                    ],
                }),
                new Paragraph({
                    text: stripHtml(item.summary),
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Projects Section
    if (sections?.projects?.items && sections.projects.items.length > 0) {
        headerItems.push(new Paragraph({
            text: sections.projects.name || "Projects",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.projects.items.filter(i => (i as any).visible !== false).forEach(item => {
            headerItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                        new TextRun({ text: ` | ${item.startDate} - ${item.endDate}`, italics: true }),
                    ],
                }),
                new Paragraph({
                    text: item.description,
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Volunteer Section
    if (sections?.volunteer?.items && sections.volunteer.items.length > 0) {
        headerItems.push(new Paragraph({
            text: sections.volunteer.name || "Volunteer Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.volunteer.items.filter(i => (i as any).visible !== false).forEach(item => {
            headerItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.position, bold: true }),
                        new TextRun({ text: ` at ${item.organization}`, italics: true }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `${item.startDate} - ${item.endDate}` }),
                    ],
                }),
                new Paragraph({
                    text: stripHtml(item.summary),
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Publications Section
    if (sections?.publications?.items && sections.publications.items.length > 0) {
        headerItems.push(new Paragraph({
            text: sections.publications.name || "Publications",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.publications.items.filter(i => (i as any).visible !== false).forEach(item => {
            headerItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                        new TextRun({ text: ` | ${item.releaseDate}`, italics: true }),
                    ],
                }),
                new Paragraph({
                    text: item.publisher,
                }),
                new Paragraph({
                    text: item.summary,
                    spacing: { after: 200 },
                })
            );
        });
    }

    // References Section
    if (sections?.references?.items && sections.references.items.length > 0) {
        headerItems.push(new Paragraph({
            text: sections.references.name || "References",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.references.items.filter(i => (i as any).visible !== false).forEach(item => {
            headerItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                    ],
                }),
                new Paragraph({
                    text: item.summary,
                }),
                new Paragraph({
                    text: [item.email, item.phone].filter(Boolean).join(" | "),
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Custom Sections
    if (data.customSections && data.customSections.length > 0) {
        data.customSections.filter(cs => cs.visible !== false).forEach(section => {
            headerItems.push(new Paragraph({
                text: section.name,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
            }));
            headerItems.push(new Paragraph({
                text: stripHtml(section.content),
                spacing: { after: 200 },
            }));
        });
    }

    // Education and Skills (Two column layout using Table)
    const sidebarItems = [];
    
    // Education Section
    if (sections?.education?.items && sections.education.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.education.name || "Education",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.education.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${item.studyType} in ${item.area}`, bold: true }),
                    ],
                }),
                new Paragraph({
                    text: item.institution,
                }),
                new Paragraph({
                    text: `${item.startDate} - ${item.endDate}`,
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Skills Section
    if (sections?.skills?.items && sections.skills.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.skills.name || "Skills",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.skills.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    text: `${item.name}: ${item.level}`,
                })
            );
        });
    }

    // Languages Section
    if (sections?.languages?.items && sections.languages.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.languages.name || "Languages",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.languages.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    text: `${item.name}: ${item.description}`,
                })
            );
        });
    }

    // Certifications Section
    if (sections?.certifications?.items && sections.certifications.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.certifications.name || "Certifications",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.certifications.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                    ],
                }),
                new Paragraph({
                    text: item.issuer,
                }),
                new Paragraph({
                    text: item.date || "",
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Awards Section
    if (sections?.awards?.items && sections.awards.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.awards.name || "Awards",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.awards.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                    ],
                }),
                new Paragraph({
                    text: item.awarder,
                }),
                new Paragraph({
                    text: item.date || "",
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Interests Section
    if (sections?.interests?.items && sections.interests.items.length > 0) {
        sidebarItems.push(new Paragraph({
            text: sections.interests.name || "Interests",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
        }));

        sections.interests.items.filter(i => (i as any).visible !== false).forEach(item => {
            sidebarItems.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                    ],
                }),
                new Paragraph({
                    text: item.keywords.join(", "),
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Combine main content and sidebar using a table for two-column effect in DOCX
    const mainTable = new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: headerItems,
                        width: { size: 65, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: sidebarItems,
                        width: { size: 35, type: WidthType.PERCENTAGE },
                    }),
                ],
            }),
        ],
    });

    const doc = new Document({
        sections: [{
            children: [mainTable],
        }],
    });

    try {
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const safeBase = sanitizeFilename(fullName) || "Resume";
        const finalFilename = `${safeBase}_CV.docx`;

        const link = document.createElement("a");
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        
        // Brief delay before cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error("Error generating DOCX:", error);
        throw error;
    }
};
