import { jsPDF } from "jspdf";
import { ResumeData } from "./resume-schema";

/**
 * Strips HTML tags from a string to get plain text.
 */
const stripHtml = (html: string): string => {
    if (typeof window !== "undefined") {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    }
    return html.replace(/<[^>]*>?/gm, "");
};

/**
 * Sanitize filename: keep letters, digits, underscores, dashes.
 */
const sanitizeFilename = (name: string): string => {
    return name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
};

// ─── LAYOUT CONSTANTS ────────────────────────────────────────────────────────

const PAGE_WIDTH = 210;      // A4 mm
const PAGE_HEIGHT = 297;     // A4 mm
const MARGIN = 14;           // mm each side
const COL_GAP = 6;           // gap between columns
const SIDEBAR_RATIO = 0.35;  // 35% right column

const BODY_W = PAGE_WIDTH - MARGIN * 2;
const RIGHT_COL_W = BODY_W * SIDEBAR_RATIO - COL_GAP / 2;
const LEFT_COL_W = BODY_W * (1 - SIDEBAR_RATIO) - COL_GAP / 2;
const LEFT_X = MARGIN;
const RIGHT_X = MARGIN + LEFT_COL_W + COL_GAP;

// Font sizes (pt → mm conversion: 1pt ≈ 0.3528mm)
const FS_NAME = 16;
const FS_TITLE = 10;
const FS_CONTACT = 8;
const FS_SECTION = 10;
const FS_BODY = 8.5;
const FS_BOLD = 8.5;
const FS_MUTED = 8;

// Leading (line height in mm)
const LH_NAME = 7;
const LH_BODY = 4.5;
const LH_SECTION_GAP = 5;
const LH_ITEM_GAP = 2.5;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [37, 99, 235]; // default blue
};

/**
 * Word-wraps text to fit within maxWidth mm and draws each line.
 * Returns the final Y position after drawing.
 */
const drawWrappedText = (
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    rightColY?: { y: number }  // pass to track parallel column
): number => {
    if (!text || !text.trim()) return y;
    const lines = pdf.splitTextToSize(text.trim(), maxWidth);
    lines.forEach((line: string) => {
        // Auto-add new page if overflow
        if (y > PAGE_HEIGHT - MARGIN) {
            pdf.addPage();
            y = MARGIN;
        }
        pdf.text(line, x, y);
        y += lineHeight;
    });
    return y;
};

/**
 * Draws a section heading with a colored underline.
 */
const drawSectionHeading = (
    pdf: jsPDF,
    label: string,
    x: number,
    y: number,
    colW: number,
    primaryRgb: [number, number, number]
): number => {
    if (y > PAGE_HEIGHT - MARGIN - 10) {
        pdf.addPage();
        y = MARGIN;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(FS_SECTION);
    pdf.setTextColor(...primaryRgb);
    pdf.text(label, x, y);
    y += 1.5;
    pdf.setDrawColor(...primaryRgb);
    pdf.setLineWidth(0.3);
    pdf.line(x, y, x + colW, y);
    y += 3;
    pdf.setTextColor(50, 50, 50);
    return y;
};

const formatDate = (start?: string, end?: string, current?: boolean): string => {
    if (!start) return "";
    const endStr = current ? "Present" : end || "Present";
    return `${start} - ${endStr}`;
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Programmatically builds a PDF from resume data using jsPDF text drawing.
 * No screenshot — results are crisp, perfectly sized, and always correct.
 */
export const exportResumeToPdf = async (
    _elementId: string,
    fullName: string = "Resume",
    resumeData?: ResumeData
): Promise<boolean> => {
    if (!resumeData) {
        throw new Error("Resume data is required for programmatic PDF export");
    }

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const { basics, sections: _sections, metadata } = resumeData;
    const sections = _sections as any;
    const primaryColor = metadata?.design?.primaryColor || "#2563eb";
    const primaryRgb = hexToRgb(primaryColor);

    let y = MARGIN;
    const pictureUrl = resumeData.picture?.url;

    // ── HEADER ────────────────────────────────────────────────────────────────
    // Profile picture (centered above name if present)
    if (pictureUrl && pictureUrl.startsWith("data:image")) {
        const imgSize = 22; // mm
        const imgX = (PAGE_WIDTH - imgSize) / 2;
        try {
            // Extract mime type for jsPDF (e.g. "image/jpeg" → "JPEG")
            const mimeMatch = pictureUrl.match(/data:image\/(\w+);/);
            const format = mimeMatch ? mimeMatch[1].toUpperCase().replace("JPG", "JPEG") : "JPEG";
            pdf.addImage(pictureUrl, format, imgX, y, imgSize, imgSize);
            y += imgSize + 6;
        } catch (e) {
            // If image fails silently skip it
            console.warn("Could not embed profile picture in PDF:", e);
        }
    }

    // Name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(FS_NAME);
    pdf.setTextColor(...primaryRgb);
    if (basics?.name) {
        pdf.text(basics.name, PAGE_WIDTH / 2, y, { align: "center" });
        y += LH_NAME;
    }

    // Title / Label
    if (basics?.label) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(FS_TITLE);
        pdf.setTextColor(60, 60, 60);
        pdf.text(basics.label, PAGE_WIDTH / 2, y, { align: "center" });
        y += 5;
    }

    // Contact line
    const contactParts = [
        basics?.email,
        basics?.phone,
        basics?.url,
        basics?.location?.city
            ? `${basics.location.city}${basics.location.region ? ", " + basics.location.region : ""}`
            : null,
    ].filter(Boolean) as string[];

    if (contactParts.length > 0) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(FS_CONTACT);
        pdf.setTextColor(80, 80, 80);
        const contactText = contactParts.join(" | ");
        const contactLines = pdf.splitTextToSize(contactText, BODY_W);
        contactLines.forEach((line: string) => {
            pdf.text(line, PAGE_WIDTH / 2, y, { align: "center" });
            y += LH_BODY;
        });
        y += 1;
    }

    // Header divider
    pdf.setDrawColor(...primaryRgb);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 4;

    // ── TWO-COLUMN BODY ───────────────────────────────────────────────────────
    // We build left and right columns separately, then merge them.
    // We draw left items starting at y, tracking leftY and rightY independently.

    let leftY = y;
    let rightY = y;

    // ─── HELPER: draw section in left column ───────────────────────────────

    const addLeftSection = (label: string, drawFn: (x: number, y: number) => number) => {
        leftY = drawSectionHeading(pdf, label, LEFT_X, leftY, LEFT_COL_W, primaryRgb);
        leftY = drawFn(LEFT_X, leftY);
        leftY += LH_SECTION_GAP;
    };

    const addRightSection = (label: string, drawFn: (x: number, y: number) => number) => {
        rightY = drawSectionHeading(pdf, label, RIGHT_X, rightY, RIGHT_COL_W, primaryRgb);
        rightY = drawFn(RIGHT_X, rightY);
        rightY += LH_SECTION_GAP;
    };

    // ─── LEFT: Summary ─────────────────────────────────────────────────────
    if (basics?.summary && stripHtml(basics.summary)) {
        addLeftSection("Summary", (x, y) => {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(FS_BODY);
            pdf.setTextColor(50, 50, 50);
            return drawWrappedText(pdf, stripHtml(basics.summary!), x, y, LEFT_COL_W, LH_BODY);
        });
    }

    // ─── LEFT: Experience ──────────────────────────────────────────────────
    const visibleExp = sections?.experience?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.experience?.visible !== false && visibleExp.length > 0) {
        addLeftSection(sections.experience!.name || "Experience", (x, y) => {
            visibleExp.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                const titleLine = [
                    item.position,
                    item.name ? `at ${item.name}` : null,
                ].filter(Boolean).join(" ");
                y = drawWrappedText(pdf, titleLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                const dateLine = [
                    formatDate(item.startDate, item.endDate, item.isWorkingHere),
                    item.location,
                ].filter(Boolean).join(" | ");
                if (dateLine) y = drawWrappedText(pdf, dateLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                if (stripHtml(item.summary)) y = drawWrappedText(pdf, stripHtml(item.summary), x, y, LEFT_COL_W, LH_BODY);
                if (idx < visibleExp.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── LEFT: Projects ────────────────────────────────────────────────────
    const visibleProj = sections?.projects?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.projects?.visible !== false && visibleProj.length > 0) {
        addLeftSection(sections.projects!.name || "Projects", (x, y) => {
            visibleProj.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                const dates = formatDate(item.startDate, item.endDate);
                const titleLine = `${item.name}${dates ? " | " + dates : ""}`;
                y = drawWrappedText(pdf, titleLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                if (item.description) y = drawWrappedText(pdf, item.description, x, y, LEFT_COL_W, LH_BODY);
                if (idx < visibleProj.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── LEFT: Volunteer ───────────────────────────────────────────────────
    const visibleVol = sections?.volunteer?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.volunteer?.visible !== false && visibleVol.length > 0) {
        addLeftSection(sections.volunteer!.name || "Volunteer", (x, y) => {
            visibleVol.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                const titleLine = [item.position, item.organization ? `at ${item.organization}` : null].filter(Boolean).join(" ");
                y = drawWrappedText(pdf, titleLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                const dateLine = formatDate(item.startDate, item.endDate);
                if (dateLine) y = drawWrappedText(pdf, dateLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                if (stripHtml(item.summary)) y = drawWrappedText(pdf, stripHtml(item.summary), x, y, LEFT_COL_W, LH_BODY);
                if (idx < visibleVol.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── LEFT: Publications ────────────────────────────────────────────────
    const visiblePub = sections?.publications?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.publications?.visible !== false && visiblePub.length > 0) {
        addLeftSection(sections.publications!.name || "Publications", (x, y) => {
            visiblePub.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                const titleLine = `${item.name}${item.releaseDate ? " | " + item.releaseDate : ""}`;
                y = drawWrappedText(pdf, titleLine, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.publisher) y = drawWrappedText(pdf, item.publisher, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                if (item.summary) y = drawWrappedText(pdf, item.summary, x, y, LEFT_COL_W, LH_BODY);
                if (idx < visiblePub.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── LEFT: References ──────────────────────────────────────────────────
    const visibleRef = sections?.references?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.references?.visible !== false && visibleRef.length > 0) {
        addLeftSection(sections.references!.name || "References", (x, y) => {
            visibleRef.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                y = drawWrappedText(pdf, item.name, x, y, LEFT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.summary) y = drawWrappedText(pdf, item.summary, x, y, LEFT_COL_W, LH_BODY);
                const contact = [item.email, item.phone].filter(Boolean).join(" | ");
                if (contact) y = drawWrappedText(pdf, contact, x, y, LEFT_COL_W, LH_BODY);
                if (idx < visibleRef.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── LEFT: Custom Sections ─────────────────────────────────────────────
    const visibleCustom = resumeData.customSections?.filter((cs) => cs.visible !== false) ?? [];
    visibleCustom.forEach((section) => {
        addLeftSection(section.name, (x, y) => {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(FS_BODY);
            pdf.setTextColor(50, 50, 50);
            return drawWrappedText(pdf, stripHtml(section.content), x, y, LEFT_COL_W, LH_BODY);
        });
    });

    // ─── RIGHT: Education ──────────────────────────────────────────────────
    const visibleEdu = sections?.education?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.education?.visible !== false && visibleEdu.length > 0) {
        addRightSection(sections.education!.name || "Education", (x, y) => {
            visibleEdu.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                const deg = [item.studyType, item.area].filter(Boolean).join(" in ");
                y = drawWrappedText(pdf, deg, x, y, RIGHT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.institution) y = drawWrappedText(pdf, item.institution, x, y, RIGHT_COL_W, LH_BODY);
                const dates = formatDate(item.startDate, item.endDate);
                if (dates) y = drawWrappedText(pdf, dates, x, y, RIGHT_COL_W, LH_BODY);
                if (idx < visibleEdu.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── RIGHT: Skills ─────────────────────────────────────────────────────
    const visibleSkills = sections?.skills?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.skills?.visible !== false && visibleSkills.length > 0) {
        addRightSection(sections.skills!.name || "Skills", (x, y) => {
            visibleSkills.forEach((item: any) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                y = drawWrappedText(pdf, `${item.name}${item.level ? ": " + item.level : ""}`, x, y, RIGHT_COL_W, LH_BODY);
            });
            return y;
        });
    }

    // ─── RIGHT: Languages ──────────────────────────────────────────────────
    const visibleLang = sections?.languages?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.languages?.visible !== false && visibleLang.length > 0) {
        addRightSection(sections.languages!.name || "Languages", (x, y) => {
            visibleLang.forEach((item: any) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_BODY);
                pdf.setTextColor(50, 50, 50);
                y = drawWrappedText(pdf, `${item.name}${item.description ? ": " + item.description : ""}`, x, y, RIGHT_COL_W, LH_BODY);
            });
            return y;
        });
    }

    // ─── RIGHT: Certifications ─────────────────────────────────────────────
    const visibleCerts = sections?.certifications?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.certifications?.visible !== false && visibleCerts.length > 0) {
        addRightSection(sections.certifications!.name || "Certifications", (x, y) => {
            visibleCerts.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                y = drawWrappedText(pdf, item.name, x, y, RIGHT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.issuer) y = drawWrappedText(pdf, item.issuer, x, y, RIGHT_COL_W, LH_BODY);
                if (item.date) y = drawWrappedText(pdf, item.date, x, y, RIGHT_COL_W, LH_BODY);
                if (idx < visibleCerts.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── RIGHT: Awards ─────────────────────────────────────────────────────
    const visibleAwards = sections?.awards?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.awards?.visible !== false && visibleAwards.length > 0) {
        addRightSection(sections.awards!.name || "Awards", (x, y) => {
            visibleAwards.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                y = drawWrappedText(pdf, item.name, x, y, RIGHT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.awarder) y = drawWrappedText(pdf, item.awarder, x, y, RIGHT_COL_W, LH_BODY);
                if (item.date) y = drawWrappedText(pdf, item.date, x, y, RIGHT_COL_W, LH_BODY);
                if (idx < visibleAwards.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── RIGHT: Interests ──────────────────────────────────────────────────
    const visibleInterests = sections?.interests?.items?.filter((i: any) => i.visible !== false) ?? [];
    if (sections?.interests?.visible !== false && visibleInterests.length > 0) {
        addRightSection(sections.interests!.name || "Interests", (x, y) => {
            visibleInterests.forEach((item: any, idx: number) => {
                if (y > PAGE_HEIGHT - MARGIN) { pdf.addPage(); y = MARGIN; }
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(FS_BOLD);
                pdf.setTextColor(30, 30, 30);
                y = drawWrappedText(pdf, item.name, x, y, RIGHT_COL_W, LH_BODY);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(FS_MUTED);
                pdf.setTextColor(100, 100, 100);
                if (item.keywords && item.keywords.length > 0) {
                    y = drawWrappedText(pdf, item.keywords.join(", "), x, y, RIGHT_COL_W, LH_BODY);
                }
                if (idx < visibleInterests.length - 1) y += LH_ITEM_GAP;
            });
            return y;
        });
    }

    // ─── SAVE ─────────────────────────────────────────────────────────────────
    const safeBase = sanitizeFilename(fullName) || "Resume";
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeBase}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);

    return true;
};

/**
 * Exports resume data as a JSON file.
 */
export const exportResumeToJson = (data: unknown, fullName: string = "Resume"): void => {
    const safeBase = sanitizeFilename(fullName) || "Resume";
    const filename = `${safeBase}_Data.json`;
    const jsonString = JSON.stringify(data, null, 2);

    const link = document.createElement("a");
    link.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(jsonString));
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
