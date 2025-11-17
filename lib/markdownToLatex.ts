/**
 * Converts Markdown with inline LaTeX to a LaTeX document body.
 * Preserves inline math $...$ and display math $$...$$.
 */

interface MathBlock {
  id: string;
  content: string;
  type: "inline" | "display";
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}");
}

export function markdownToLatex(markdown: string): string {
  const mathBlocks: MathBlock[] = [];
  let processed = markdown;

  // Step 1: Extract and protect all math (use safe placeholder without special chars)

  // Display math $$...$$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, content) => {
    const id = `XMATHBLKDISP${mathBlocks.length}ENDX`;
    mathBlocks.push({ id, content: content.trim(), type: "display" });
    return ` ${id} `;
  });

  // Inline math $...$
  processed = processed.replace(/\$([^\n$]+?)\$/g, (_, content) => {
    const id = `XMATHBLKINLN${mathBlocks.length}ENDX`;
    mathBlocks.push({ id, content: content.trim(), type: "inline" });
    return id;
  });

  // Step 2: Convert Markdown structural elements

  // Headers (process these first, before escaping)
  const lines = processed.split("\n");
  const processedLines: string[] = [];

  for (let line of lines) {
    // Check for headers
    if (/^### /.test(line)) {
      const text = line.replace(/^### /, "").trim();
      processedLines.push(`\\subsection{${text}}`);
    } else if (/^## /.test(line)) {
      const text = line.replace(/^## /, "").trim();
      processedLines.push(`\\section{${text}}`);
    } else if (/^# /.test(line)) {
      const text = line.replace(/^# /, "").trim();
      processedLines.push(`\\section*{${text}}`);
    } else {
      processedLines.push(line);
    }
  }

  processed = processedLines.join("\n");

  // Step 3: Convert inline formatting (bold, italic, code)

  // Inline code
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    return `\\texttt{${code}}`;
  });

  // Bold + Italic combined
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, (_, text) => {
    return `\\textbf{\\textit{${text}}}`;
  });

  // Bold
  processed = processed.replace(/\*\*(.+?)\*\*/g, (_, text) => {
    return `\\textbf{${text}}`;
  });

  // Italic
  processed = processed.replace(/\*(.+?)\*/g, (_, text) => {
    return `\\textit{${text}}`;
  });

  processed = processed.replace(/_([^_\s]+(?:\s+[^_\s]+)*)_/g, (_, text) => {
    return `\\textit{${text}}`;
  });

  // Step 4: Convert lists

  const listLines = processed.split("\n");
  const output: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;

  for (let line of listLines) {
    const isBullet = /^[\-\*]\s+/.test(line);
    const isNumbered = /^\d+\.\s+/.test(line);

    if (isBullet) {
      if (inNumberedList) {
        output.push("\\end{enumerate}");
        inNumberedList = false;
      }
      if (!inBulletList) {
        output.push("\\begin{itemize}");
        inBulletList = true;
      }
      const content = line.replace(/^[\-\*]\s+/, "");
      output.push(`  \\item ${content}`);
    } else if (isNumbered) {
      if (inBulletList) {
        output.push("\\end{itemize}");
        inBulletList = false;
      }
      if (!inNumberedList) {
        output.push("\\begin{enumerate}");
        inNumberedList = true;
      }
      const content = line.replace(/^\d+\.\s+/, "");
      output.push(`  \\item ${content}`);
    } else {
      if (inBulletList) {
        output.push("\\end{itemize}");
        inBulletList = false;
      }
      if (inNumberedList) {
        output.push("\\end{enumerate}");
        inNumberedList = false;
      }
      output.push(line);
    }
  }

  if (inBulletList) {
    output.push("\\end{itemize}");
  }
  if (inNumberedList) {
    output.push("\\end{enumerate}");
  }

  processed = output.join("\n");

  // Step 5: Escape LaTeX special characters (but NOT in math placeholders)

  // Split by placeholders
  const placeholderPattern = /XMATHBLK(?:DISP|INLN)\d+ENDX/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = placeholderPattern.exec(processed)) !== null) {
    // Escape text before this placeholder
    if (match.index > lastIndex) {
      parts.push(escapeLatex(processed.slice(lastIndex, match.index)));
    }
    // Keep placeholder as-is
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  // Escape remaining text
  if (lastIndex < processed.length) {
    parts.push(escapeLatex(processed.slice(lastIndex)));
  }

  processed = parts.join("");

  // Step 6: Restore math blocks
  for (const block of mathBlocks) {
    const replacement = block.type === "display"
      ? `\n\\[\n${block.content}\n\\]\n`
      : `$${block.content}$`;
    processed = processed.replace(block.id, replacement);
  }

  return processed;
}
