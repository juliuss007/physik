/**
 * Converts Markdown with inline LaTeX to a LaTeX document body.
 * Escapes text inline as we convert markdown to LaTeX.
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

  // Step 1: Extract and protect all math
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, content) => {
    const id = `XMATHBLKDISP${mathBlocks.length}ENDX`;
    mathBlocks.push({ id, content: content.trim(), type: "display" });
    return ` ${id} `;
  });

  processed = processed.replace(/\$([^\n$]+?)\$/g, (_, content) => {
    const id = `XMATHBLKINLN${mathBlocks.length}ENDX`;
    mathBlocks.push({ id, content: content.trim(), type: "inline" });
    return id;
  });

  // Step 2: Convert inline formatting (escape text content)
  // Order: code first, then combined formats, then single formats

  // Inline code
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    return `\\texttt{${escapeLatex(code)}}`;
  });

  // Bold + Italic combined
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, (_, text) => {
    return `\\textbf{\\textit{${escapeLatex(text)}}}`;
  });

  // Bold
  processed = processed.replace(/\*\*(.+?)\*\*/g, (_, text) => {
    return `\\textbf{${escapeLatex(text)}}`;
  });

  // Italic with *
  processed = processed.replace(/\*(.+?)\*/g, (_, text) => {
    return `\\textit{${escapeLatex(text)}}`;
  });

  // Italic with _
  processed = processed.replace(/_([^_\s]+(?:\s+[^_\s]+)*)_/g, (_, text) => {
    return `\\textit{${escapeLatex(text)}}`;
  });

  // Step 3: Process lines for headers and lists
  const lines = processed.split("\n");
  const output: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;

  for (let line of lines) {
    // Headers - don't escape (content already has formatting converted)
    if (/^### /.test(line)) {
      const text = line.replace(/^### /, "").trim();
      output.push(`\\subsection{${text}}`);
    } else if (/^## /.test(line)) {
      const text = line.replace(/^## /, "").trim();
      output.push(`\\section{${text}}`);
    } else if (/^# /.test(line)) {
      const text = line.replace(/^# /, "").trim();
      output.push(`\\section*{${text}}`);
    }
    // Bullet lists
    else if (/^[\-\*]\s+/.test(line)) {
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
    }
    // Numbered lists
    else if (/^\d+\.\s+/.test(line)) {
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
    }
    // Regular paragraphs - escape if no LaTeX commands present
    else {
      if (inBulletList) {
        output.push("\\end{itemize}");
        inBulletList = false;
      }
      if (inNumberedList) {
        output.push("\\end{enumerate}");
        inNumberedList = false;
      }

      // Only escape if line has no LaTeX commands (no backslash)
      // Lines with formatting will have \textbf, \textit, etc.
      if (line.trim() && !line.includes("\\") && !line.match(/XMATHBLK/)) {
        output.push(escapeLatex(line));
      } else {
        output.push(line);
      }
    }
  }

  if (inBulletList) {
    output.push("\\end{itemize}");
  }
  if (inNumberedList) {
    output.push("\\end{enumerate}");
  }

  processed = output.join("\n");

  // Step 4: Restore math blocks
  for (const block of mathBlocks) {
    const replacement = block.type === "display"
      ? `\n\\[\n${block.content}\n\\]\n`
      : `\\(${block.content}\\)`;  // Use \(...\) instead of $...$ for better compatibility
    processed = processed.replace(block.id, replacement);
  }

  return processed;
}
