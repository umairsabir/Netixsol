"use client";

import React from "react";
import { ResumeData } from "@/lib/resume-schema";
import { cn } from "@/lib/utils";

interface ModernTemplateProps {
  data: ResumeData;
  className?: string;
}

const stripHtml = (html: string): string => {
  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
};

export const ModernTemplate: React.FC<ModernTemplateProps> = ({
  data,
  className,
}) => {
  const { basics, sections: _sections, metadata } = data;
  // Cast to any so non-null assertions inside JSX don't cause TS errors at build time
  // (all usages are already guarded by outer `sections?.x?.visible !== false && items.length > 0` checks)
  const sections = _sections as any;
  const primaryColor = metadata?.design?.primaryColor || "#2563eb";
  const sidebarWidth = (metadata as any)?.layout?.sidebarWidth || 35;
  const leftWidth = 100 - sidebarWidth;

  const formatDate = (start?: string, end?: string, current?: boolean) => {
    if (!start) return "";
    const endStr = current ? "Present" : end || "Present";
    return `${start} - ${endStr}`;
  };

  // Shared heading style matching the Word doc: colored, slightly larger, followed by a thin border
  const sectionHeadingStyle: React.CSSProperties = {
    color: primaryColor,
    fontSize: "11pt",
    fontWeight: "bold",
    borderBottom: `1px solid ${primaryColor}`,
    paddingBottom: "2px",
    marginBottom: "6px",
    marginTop: "0",
  };

  const bodyTextStyle: React.CSSProperties = {
    fontSize: "9pt",
    color: "#333",
    lineHeight: "1.4",
    margin: 0,
  };

  const boldTextStyle: React.CSSProperties = {
    ...bodyTextStyle,
    fontWeight: "bold",
    color: "#111",
  };

  const mutedTextStyle: React.CSSProperties = {
    ...bodyTextStyle,
    color: "#555",
  };

  return (
    <div
      id="resume-render"
      className={cn("bg-white font-sans", className)}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "9pt",
        color: "#333",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER (centered, matches Word output) ── */}
      <div
        style={{
          textAlign: "center",
          borderBottom: `2px solid ${primaryColor}`,
          paddingBottom: "8px",
          marginBottom: "10px",
        }}
      >
        {data.picture?.url && (
          <div style={{ marginBottom: "6px" }}>
            <img
              src={data.picture.url}
              alt={basics?.name}
              style={{
                width: "70px",
                height: "70px",
                objectFit: "cover",
                display: "inline-block",
              }}
            />
          </div>
        )}
        <div
          style={{
            fontSize: "18pt",
            fontWeight: "bold",
            color: primaryColor,
            marginBottom: "2px",
          }}
        >
          {basics?.name}
        </div>
        {basics?.label && (
          <div style={{ fontSize: "10pt", color: "#444", marginBottom: "4px" }}>
            {basics.label}
          </div>
        )}
        <div style={{ fontSize: "8.5pt", color: "#555" }}>
          {[
            basics?.email,
            basics?.phone ? `+${basics.phone}` : null,
            basics?.url,
            basics?.location?.city
              ? `${basics.location.city}${basics.location.region ? ", " + basics.location.region : ""}`
              : null,
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>
      </div>

      {/* ── TWO-COLUMN BODY ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            {/* ─── LEFT COLUMN ─── */}
            <td
              style={{
                width: `${leftWidth}%`,
                verticalAlign: "top",
                paddingRight: "14px",
                borderRight: `1px dashed #ccc`,
              }}
            >
              {/* Summary */}
              {basics?.summary && stripHtml(basics.summary) && (
                <div style={{ marginBottom: "10px" }}>
                  <h2 style={sectionHeadingStyle}>Summary</h2>
                  <p style={bodyTextStyle}>{stripHtml(basics.summary)}</p>
                </div>
              )}

              {/* Experience */}
              {sections?.experience?.visible !== false &&
                (sections?.experience?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.experience!.name || "Experience"}
                    </h2>
                    {sections.experience!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <p style={boldTextStyle}>
                              {item.position}
                              {item.name && (
                                <span style={{ fontWeight: "normal", fontStyle: "italic" }}>
                                  {" "}
                                  at {item.name}
                                </span>
                              )}
                            </p>
                          </div>
                          <p style={mutedTextStyle}>
                            {formatDate(item.startDate, item.endDate, item.isWorkingHere)}
                            {item.location && ` | ${item.location}`}
                          </p>
                          {stripHtml(item.summary) && (
                            <p style={{ ...bodyTextStyle, marginTop: "2px" }}>
                              {stripHtml(item.summary)}
                            </p>
                          )}
                          {item.highlights && item.highlights.length > 0 && (
                            <ul style={{ ...bodyTextStyle, paddingLeft: "14px", margin: "2px 0 0" }}>
                              {item.highlights.map((h: any, i: number) => <li key={i}>{h}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                )}

              {/* Projects */}
              {sections?.projects?.visible !== false &&
                (sections?.projects?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.projects!.name || "Projects"}
                    </h2>
                    {sections.projects!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <p style={boldTextStyle}>
                            {item.name}
                            {(item.startDate || item.endDate) && (
                              <span style={{ fontWeight: "normal", fontStyle: "italic" }}>
                                {" "}| {formatDate(item.startDate, item.endDate)}
                              </span>
                            )}
                          </p>
                          {item.description && (
                            <p style={bodyTextStyle}>{item.description}</p>
                          )}
                          {item.highlights && item.highlights.length > 0 && (
                            <ul style={{ ...bodyTextStyle, paddingLeft: "14px", margin: "2px 0 0" }}>
                              {item.highlights.map((h: any, i: number) => <li key={i}>{h}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                )}

              {/* Volunteer */}
              {sections?.volunteer?.visible !== false &&
                (sections?.volunteer?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.volunteer!.name || "Volunteer"}
                    </h2>
                    {sections.volunteer!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <p style={boldTextStyle}>
                            {item.position}
                            {item.organization && (
                              <span style={{ fontWeight: "normal", fontStyle: "italic" }}>
                                {" "}at {item.organization}
                              </span>
                            )}
                          </p>
                          <p style={mutedTextStyle}>
                            {formatDate(item.startDate, item.endDate)}
                          </p>
                          {stripHtml(item.summary) && (
                            <p style={{ ...bodyTextStyle, marginTop: "2px" }}>
                              {stripHtml(item.summary)}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}

              {/* Publications */}
              {sections?.publications?.visible !== false &&
                (sections?.publications?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.publications!.name || "Publications"}
                    </h2>
                    {sections.publications!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <p style={boldTextStyle}>
                            {item.name}
                            {item.releaseDate && (
                              <span style={{ fontWeight: "normal", fontStyle: "italic" }}>
                                {" "}| {item.releaseDate}
                              </span>
                            )}
                          </p>
                          {item.publisher && <p style={mutedTextStyle}>{item.publisher}</p>}
                          {item.summary && <p style={bodyTextStyle}>{item.summary}</p>}
                        </div>
                      ))}
                  </div>
                )}

              {/* References */}
              {sections?.references?.visible !== false &&
                (sections?.references?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.references!.name || "References"}
                    </h2>
                    {sections.references!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <p style={boldTextStyle}>{item.name}</p>
                          {item.summary && <p style={mutedTextStyle}>{item.summary}</p>}
                          <p style={bodyTextStyle}>
                            {[item.email, item.phone].filter(Boolean).join(" | ")}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

              {/* Custom Sections */}
              {data.customSections
                ?.filter((cs) => cs.visible !== false)
                .map((section: any) => (
                  <div key={section.id} style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>{section.name}</h2>
                    <p style={bodyTextStyle}>{stripHtml(section.content)}</p>
                  </div>
                ))}
            </td>

            {/* ─── RIGHT COLUMN (SIDEBAR) ─── */}
            <td
              style={{
                width: `${sidebarWidth}%`,
                verticalAlign: "top",
                paddingLeft: "14px",
              }}
            >
              {/* Education */}
              {sections?.education?.visible !== false &&
                (sections?.education?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.education!.name || "Education"}
                    </h2>
                    {sections.education!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "8px" }}>
                          <p style={boldTextStyle}>
                            {item.studyType && item.area
                              ? `${item.studyType} in ${item.area}`
                              : item.studyType || item.area}
                          </p>
                          <p style={mutedTextStyle}>{item.institution}</p>
                          <p style={mutedTextStyle}>{formatDate(item.startDate, item.endDate)}</p>
                        </div>
                      ))}
                  </div>
                )}

              {/* Skills */}
              {sections?.skills?.visible !== false &&
                (sections?.skills?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.skills!.name || "Skills"}
                    </h2>
                    {sections.skills!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <p key={item.id} style={bodyTextStyle}>
                          {item.name}
                          {item.level && (
                            <span style={mutedTextStyle}>: {item.level}</span>
                          )}
                        </p>
                      ))}
                  </div>
                )}

              {/* Languages */}
              {sections?.languages?.visible !== false &&
                (sections?.languages?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.languages!.name || "Languages"}
                    </h2>
                    {sections.languages!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <p key={item.id} style={bodyTextStyle}>
                          {item.name}
                          {item.description && (
                            <span style={mutedTextStyle}>: {item.description}</span>
                          )}
                        </p>
                      ))}
                  </div>
                )}

              {/* Certifications */}
              {sections?.certifications?.visible !== false &&
                (sections?.certifications?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.certifications!.name || "Certifications"}
                    </h2>
                    {sections.certifications!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "6px" }}>
                          <p style={boldTextStyle}>{item.name}</p>
                          <p style={mutedTextStyle}>{item.issuer}</p>
                          {item.date && <p style={mutedTextStyle}>{item.date}</p>}
                        </div>
                      ))}
                  </div>
                )}

              {/* Awards */}
              {sections?.awards?.visible !== false &&
                (sections?.awards?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.awards!.name || "Awards"}
                    </h2>
                    {sections.awards!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "6px" }}>
                          <p style={boldTextStyle}>{item.name}</p>
                          {item.awarder && <p style={mutedTextStyle}>{item.awarder}</p>}
                          {item.date && <p style={mutedTextStyle}>{item.date}</p>}
                        </div>
                      ))}
                  </div>
                )}

              {/* Interests */}
              {sections?.interests?.visible !== false &&
                (sections?.interests?.items?.filter((i: any) => i.visible !== false).length ?? 0) > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h2 style={sectionHeadingStyle}>
                      {sections.interests!.name || "Interests"}
                    </h2>
                    {sections.interests!.items
                      .filter((i: any) => i.visible !== false)
                      .map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "6px" }}>
                          <p style={boldTextStyle}>{item.name}</p>
                          {item.keywords && item.keywords.length > 0 && (
                            <p style={mutedTextStyle}>{item.keywords.join(", ")}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
