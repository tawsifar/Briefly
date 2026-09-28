import { jsPDF } from "jspdf";
import { ProjectBrief, formatStandardDate } from "./types";

export function exportBriefToPdf(brief: ProjectBrief) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const createdDateStr = brief.createdDateFormatted || formatStandardDate(brief.created_at);

  const drawPageHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("BRIEFLY · INTAKE INTELLIGENCE & PROJECT ALIGNMENT", margin, y);
    doc.setFont("helvetica", "normal");
    const briefIdDisplay = brief.id.startsWith("brief_") ? brief.id.slice(0, 12) : `brief_${brief.id.slice(0, 6)}`;
    doc.text(`${briefIdDisplay} | ${createdDateStr}`, pageWidth - margin, y, { align: "right" });
    y += 3.5;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  // 1. Initial Page Header
  drawPageHeader();

  // Document Type Badge
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, 52, 6, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  doc.text("PROJECT BRIEF SPECIFICATION", margin + 3.5, y + 4.2);

  // Status Badge per Rule 6 (EVIDENCE CHECKED or NEEDS REVIEW, never VERIFIED)
  const isEvidenceChecked = brief.status === "EVIDENCE CHECKED" || brief.status === "complete";
  const statusLabel = isEvidenceChecked ? "EVIDENCE CHECKED" : "NEEDS REVIEW";
  const badgeWidth = isEvidenceChecked ? 36 : 30;
  const badgeX = pageWidth - margin - badgeWidth;

  if (isEvidenceChecked) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(badgeX, y, badgeWidth, 6, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text(statusLabel, badgeX + 3, y + 4.2);
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(badgeX, y, badgeWidth, 6, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(statusLabel, badgeX + 3, y + 4.2);
  }

  y += 7.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Quotes checked against the client message. Not yet confirmed with the client.",
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 4;

  // Project Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(17, 24, 39);
  const titleText = brief.title || brief.project?.name || "Project Brief";
  const titleLines = doc.splitTextToSize(titleText, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7.5 + 4;

  // Three Boxes: TARGET DEADLINE | CLARITY SCORE | CREATED DATE
  const targetDeadline = brief.targetDeadline;
  const line1 = targetDeadline?.displayLine1 || brief.project?.deadline || "Not specified by client";
  const line2 = targetDeadline?.displayLine2 || "Target dates to be confirmed during kickoff.";

  const clarityScore = brief.clarityData?.overall ?? brief.scores?.overall ?? 50;
  const clarityBand = brief.clarityData?.band || (clarityScore >= 85 ? "Ready for kickoff" : clarityScore >= 65 ? "Mostly clear" : "Needs alignment");

  const boxWidth = (contentWidth - 6) / 3;
  const boxHeight = 17;

  // Box 1: TARGET DEADLINE
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("TARGET DEADLINE", margin + 3.5, y + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const line1Split = doc.splitTextToSize(line1, boxWidth - 6);
  doc.text(line1Split[0] || line1, margin + 3.5, y + 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const line2Split = doc.splitTextToSize(line2, boxWidth - 6);
  doc.text(line2Split[0] || line2, margin + 3.5, y + 14);

  // Box 2: CLARITY SCORE
  const box2X = margin + boxWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(box2X, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("CLARITY SCORE", box2X + 3.5, y + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${clarityScore}/100`, box2X + 3.5, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text(clarityBand, box2X + 3.5, y + 14.5);

  // Box 3: CREATED DATE
  const box3X = margin + (boxWidth + 3) * 2;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(box3X, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("CREATED DATE", box3X + 3.5, y + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(createdDateStr, box3X + 3.5, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Intake analysis", box3X + 3.5, y + 14.5);

  y += boxHeight + 8;

  // -------------------------------------------------------------
  // SECTION 1: Executive Summary & Core Goal
  // -------------------------------------------------------------
  checkPageBreak(38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("1. Executive Summary & Core Goal", margin, y);
  y += 5.5;

  // Project Goal
  const goalText = brief.executiveSummary?.goal || brief.project?.goal || "Establish project scope.";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  doc.text("Project Goal:", margin, y);
  doc.setFont("helvetica", "normal");
  const goalLines = doc.splitTextToSize(goalText, contentWidth - 22);
  doc.text(goalLines, margin + 20, y);
  y += goalLines.length * 4.2 + 3;

  // Summary Paragraph
  const summaryPara = brief.executiveSummary?.paragraph || brief.project?.summary || "";
  if (summaryPara) {
    checkPageBreak(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    const summaryLines = doc.splitTextToSize(summaryPara, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4.2 + 4;
  }

  // Key Facts at a glance grid
  const keyFacts = brief.executiveSummary?.keyFacts || [];
  if (keyFacts.length > 0) {
    checkPageBreak(20);
    const gridCols = 2;
    const colW = (contentWidth - 4) / gridCols;
    const rowH = 9;

    for (let i = 0; i < keyFacts.length; i += 2) {
      checkPageBreak(rowH + 2);
      const fact1 = keyFacts[i];
      const fact2 = keyFacts[i + 1];

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(margin, y, colW, rowH, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(fact1.label.toUpperCase(), margin + 3, y + 3.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(31, 41, 55);
      const val1Lines = doc.splitTextToSize(fact1.value, colW - 6);
      doc.text(val1Lines[0] || fact1.value, margin + 3, y + 7);

      if (fact2) {
        const x2 = margin + colW + 4;
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(x2, y, colW, rowH, 1, 1, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(fact2.label.toUpperCase(), x2 + 3, y + 3.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(31, 41, 55);
        const val2Lines = doc.splitTextToSize(fact2.value, colW - 6);
        doc.text(val2Lines[0] || fact2.value, x2 + 3, y + 7);
      }
      y += rowH + 2;
    }
  }

  y += 4;

  // -------------------------------------------------------------
  // SECTION 2: Confirmed Deliverables (In-Scope)
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("2. Confirmed Deliverables (In-Scope)", margin, y);
  y += 6;

  const deliverables = brief.structuredDeliverables || [];
  if (deliverables.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text("No explicit deliverables confirmed in the initial message.", margin, y);
    y += 6;
  } else {
    // Group deliverables by group
    const groups: Array<"Pages" | "Design and Experience" | "Content and Assets" | "Features"> = [
      "Pages",
      "Design and Experience",
      "Content and Assets",
      "Features",
    ];

    groups.forEach((grp) => {
      const itemsInGroup = deliverables.filter((d) => d.group === grp);
      if (itemsInGroup.length === 0) return;

      checkPageBreak(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      doc.text(grp.toUpperCase(), margin, y);
      y += 4.5;

      itemsInGroup.forEach((item) => {
        checkPageBreak(17);

        // Checkmark indicator circle
        doc.setFillColor(22, 101, 52);
        doc.circle(margin + 2.5, y - 0.8, 1.2, "F");

        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(17, 24, 39);
        doc.text(item.label, margin + 6, y);

        // Tag Badge (Confirmed / Needs scoping)
        const isConfirmed = item.tag === "Confirmed";
        const tagText = isConfirmed ? "CONFIRMED" : "NEEDS SCOPING";
        const tagW = isConfirmed ? 22 : 27;
        const tagX = pageWidth - margin - tagW;
        doc.setFillColor(isConfirmed ? 236 : 254, isConfirmed ? 253 : 243, isConfirmed ? 245 : 199);
        doc.roundedRect(tagX, y - 3.2, tagW, 4.5, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(isConfirmed ? 22 : 180, isConfirmed ? 101 : 83, isConfirmed ? 52 : 9);
        doc.text(tagText, tagX + 2, y);

        y += 4;

        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(75, 85, 99);
        const descLines = doc.splitTextToSize(item.description, contentWidth - 8);
        doc.text(descLines, margin + 6, y);
        y += descLines.length * 3.8 + 1.5;

        // Evidence quote in small italic with thin left border
        if (item.evidence) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(107, 114, 128);
          const evLines = doc.splitTextToSize(`"${item.evidence}"`, contentWidth - 12);
          const evH = evLines.length * 3.6;

          doc.setDrawColor(209, 213, 219);
          doc.setLineWidth(0.4);
          doc.line(margin + 6, y - 1, margin + 6, y + evH - 2);

          doc.text(evLines, margin + 9, y + 2);
          y += evH + 3.5;
        } else {
          y += 2;
        }
      });
      y += 2;
    });
  }

  y += 3;

  // -------------------------------------------------------------
  // SECTION 3: Flagged Ambiguities (Requires Alignment)
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("3. Flagged Ambiguities (Requires Alignment)", margin, y);
  y += 6;

  const ambiguities = brief.structuredAmbiguities || [];
  if (ambiguities.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text("No ambiguities flagged.", margin, y);
    y += 6;
  } else {
    // Sorted HIGH, MEDIUM, LOW
    const orderMap: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sortedAmbiguities = [...ambiguities].sort(
      (a, b) => (orderMap[a.severity] || 2) - (orderMap[b.severity] || 2)
    );

    sortedAmbiguities.forEach((amb) => {
      checkPageBreak(24);

      // Ambiguity Card Frame
      const startCardY = y;

      // Severity badge
      const isHigh = amb.severity === "HIGH";
      const isMed = amb.severity === "MEDIUM";
      const sevBgR = isHigh ? 254 : isMed ? 254 : 241;
      const sevBgG = isHigh ? 242 : isMed ? 243 : 245;
      const sevBgB = isHigh ? 242 : isMed ? 199 : 249;

      const sevTextR = isHigh ? 185 : isMed ? 180 : 71;
      const sevTextG = isHigh ? 28 : isMed ? 83 : 85;
      const sevTextB = isHigh ? 28 : isMed ? 9 : 105;

      doc.setFillColor(sevBgR, sevBgG, sevBgB);
      doc.roundedRect(margin, y - 3, 14, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(sevTextR, sevTextG, sevTextB);
      doc.text(amb.severity, margin + 2, y + 0.2);

      // Title & ID
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(`${amb.id}: ${amb.title}`, margin + 17, y);

      // Linked Question label on right
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(`Linked Question: ${amb.linkedQuestionId}`, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      // Evidence quote if present
      if (amb.evidence) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(107, 114, 128);
        const evLines = doc.splitTextToSize(`Evidence: "${amb.evidence}"`, contentWidth - 6);
        const evH = evLines.length * 3.6;

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.4);
        doc.line(margin + 2, y - 1, margin + 2, y + evH - 2);

        doc.text(evLines, margin + 5, y + 2);
        y += evH + 2.5;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        doc.text("Not mentioned in the message", margin + 5, y + 1);
        y += 4;
      }

      // What is unclear
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(55, 65, 81);
      doc.text("What is unclear:", margin + 5, y);
      doc.setFont("helvetica", "normal");
      const unclearLines = doc.splitTextToSize(amb.whatIsUnclear, contentWidth - 30);
      doc.text(unclearLines, margin + 28, y);
      y += unclearLines.length * 3.8 + 1.5;

      // Why it matters
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(55, 65, 81);
      doc.text("Why it matters:", margin + 5, y);
      doc.setFont("helvetica", "normal");
      const whyLines = doc.splitTextToSize(amb.whyItMatters, contentWidth - 28);
      doc.text(whyLines, margin + 26, y);
      y += whyLines.length * 3.8 + 4;
    });
  }

  y += 3;

  // -------------------------------------------------------------
  // SECTION 4: Ready-to-Send Client Questions
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("4. Ready-to-Send Client Questions", margin, y);
  y += 6;

  const questions = brief.structuredQuestions || [];
  if (questions.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text("No client clarification questions generated.", margin, y);
    y += 6;
  } else {
    questions.forEach((q) => {
      checkPageBreak(18);

      // Question ID Pill
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y - 3, 10, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(55, 65, 81);
      doc.text(q.id, margin + 2.5, y + 0.2);

      // Question text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      const qTextLines = doc.splitTextToSize(`"${q.text}"`, contentWidth - 14);
      doc.text(qTextLines, margin + 13, y);
      y += qTextLines.length * 4.2 + 1.5;

      // Rationale
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text("Rationale:", margin + 13, y);
      doc.setFont("helvetica", "normal");
      const rLines = doc.splitTextToSize(q.rationale, contentWidth - 30);
      doc.text(rLines, margin + 28, y);
      y += rLines.length * 3.8 + 4;
    });
  }

  y += 3;

  // -------------------------------------------------------------
  // SECTION 5: Out of Scope / Phase 2 Defers
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("5. Out of Scope / Phase 2 Defers", margin, y);
  y += 6;

  const outOfScope = brief.structuredOutOfScope || [];
  const group1 = outOfScope.filter((o) => o.group === "Pending client decision");
  const group2 = outOfScope.filter((o) => o.group === "Not mentioned, excluded unless confirmed");

  // Group 1: Pending client decision
  if (group1.length > 0) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("PENDING CLIENT DECISION (CONDITIONAL ITEMS)", margin, y);
    y += 4.5;

    group1.forEach((item) => {
      checkPageBreak(12);
      doc.setFillColor(245, 158, 11);
      doc.circle(margin + 2.5, y - 0.8, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(17, 24, 39);
      doc.text(item.label, margin + 6, y);
      y += 3.8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      const reasonLines = doc.splitTextToSize(item.reason, contentWidth - 8);
      doc.text(reasonLines, margin + 6, y);
      y += reasonLines.length * 3.8 + 2;
    });
    y += 2;
  }

  // Group 2: Not mentioned, excluded unless confirmed
  if (group2.length > 0) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text("EXCLUDED UNLESS CONFIRMED (STANDARD ASSUMPTIONS)", margin, y);
    y += 4.5;

    group2.slice(0, 6).forEach((item) => {
      checkPageBreak(11);
      doc.setFillColor(156, 163, 175);
      doc.circle(margin + 2.5, y - 0.8, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(55, 65, 81);
      doc.text(item.label, margin + 6, y);
      y += 3.8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      const rLines = doc.splitTextToSize(item.reason, contentWidth - 8);
      doc.text(rLines, margin + 6, y);
      y += rLines.length * 3.8 + 2;
    });
  }

  y += 3;

  // -------------------------------------------------------------
  // SECTION 6: Project Delivery Risks & Recommendations
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("6. Project Delivery Risks & Recommendations", margin, y);
  y += 6;

  const risks = brief.structuredRisks || [];
  if (risks.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text("No immediate delivery risks identified.", margin, y);
  } else {
    risks.forEach((risk) => {
      checkPageBreak(19);

      // Severity badge
      const isHigh = risk.severity === "HIGH";
      const isMed = risk.severity === "MEDIUM";
      const rBgR = isHigh ? 254 : isMed ? 254 : 241;
      const rBgG = isHigh ? 242 : isMed ? 243 : 245;
      const rBgB = isHigh ? 242 : isMed ? 199 : 249;

      const rTextR = isHigh ? 185 : isMed ? 180 : 71;
      const rTextG = isHigh ? 28 : isMed ? 83 : 85;
      const rTextB = isHigh ? 28 : isMed ? 9 : 105;

      doc.setFillColor(rBgR, rBgG, rBgB);
      doc.roundedRect(margin, y - 3, 14, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(rTextR, rTextG, rTextB);
      doc.text(risk.severity, margin + 2, y + 0.2);

      // Title & Owner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(`${risk.id}: ${risk.title}`, margin + 17, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Owner: ${risk.owner}`, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      // Explanation
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99);
      const expLines = doc.splitTextToSize(risk.explanation, contentWidth - 5);
      doc.text(expLines, margin + 5, y);
      y += expLines.length * 3.8 + 1.5;

      // Recommended Action
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(22, 101, 52);
      doc.text("Action:", margin + 5, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const actLines = doc.splitTextToSize(risk.recommendedAction, contentWidth - 18);
      doc.text(actLines, margin + 16, y);
      y += actLines.length * 3.8 + 4;
    });
  }

  // Add standard footer to all pages: "Briefly Intake Intelligence · Page X of Y"
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Briefly Intake Intelligence · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Trigger browser download
  const safeTitle = (brief.title || brief.project?.name || "Project-Brief")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();
  doc.save(`${safeTitle}-brief.pdf`);
}
