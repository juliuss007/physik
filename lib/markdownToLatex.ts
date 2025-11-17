/**
 * Converts Markdown + inline LaTeX to LaTeX body
 */

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%_#&{}])/g, "\\$1")
    .replace(/\~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function markdownToLatex(markdown: string): string {
  // Protect math blocks first
  const mathBlocks: string[] = [];
  let processed = markdown;

  // Protect display math $$...$$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
    const placeholder = `__DISPLAYMATH_${mathBlocks.length}__`;
    mathBlocks.push(match);
    return placeholder;
  });

  // Protect inline math $...$
  processed = processed.replace(/\$([^$\n]+?)\$/g, (match) => {
    const placeholder = `__INLINEMATH_${mathBlocks.length}__`;
    mathBlocks.push(match);
    return placeholder;
  });

  // Protect inline code `...`
  processed = processed.replace(/`([^`]+?)`/g, (_, code) => {
    const placeholder = `__CODE_${mathBlocks.length}__`;
    mathBlocks.push(`\\texttt{${code}}`);
    return placeholder;
  });

  // Convert headers
  processed = processed.replace(/^### (.+)$/gm, (_, text) => `\\subsection{${escapeLatex(text)}}`);
  processed = processed.replace(/^## (.+)$/gm, (_, text) => `\\section{${escapeLatex(text)}}`);
  processed = processed.replace(/^# (.+)$/gm, (_, text) => `\\section{${escapeLatex(text)}}`);

  // Convert bold/italic (outside math)
  processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, (_, text) => `\\textbf{\\textit{${escapeLatex(text)}}}`);
  processed = processed.replace(/\*\*(.+?)\*\*/g, (_, text) => `\\textbf{${escapeLatex(text)}}`);
  processed = processed.replace(/\*(.+?)\*/g, (_, text) => `\\textit{${escapeLatex(text)}}`);
  processed = processed.replace(/_(.+?)_/g, (_, text) => `\\textit{${escapeLatex(text)}}`);

  // Convert bullet lists (- or *)
  const bulletListRegex = /^[\-\*]\s+(.+)$/gm;
  const lines = processed.split("\n");
  const output: string[] = [];
  let inBulletList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[\-\*]\s+/.test(line);

    if (isBullet) {
      if (!inBulletList) {
        output.push("\\begin{itemize}");
        inBulletList = true;
      }
      const content = line.replace(/^[\-\*]\s+/, "");
      output.push(`\\item ${content}`);
    } else {
      if (inBulletList) {
        output.push("\\end{itemize}");
        inBulletList = false;
      }
      output.push(line);
    }
  }

  if (inBulletList) {
    output.push("\\end{itemize}");
  }

  processed = output.join("\n");

  // Convert numbered lists (1. )
  const numberedLines = processed.split("\n");
  const output2: string[] = [];
  let inNumberedList = false;

  for (let i = 0; i < numberedLines.length; i++) {
    const line = numberedLines[i];
    const isNumbered = /^\d+\.\s+/.test(line);

    if (isNumbered) {
      if (!inNumberedList) {
        output2.push("\\begin{enumerate}");
        inNumberedList = true;
      }
      const content = line.replace(/^\d+\.\s+/, "");
      output2.push(`\\item ${content}`);
    } else {
      if (inNumberedList) {
        output2.push("\\end{enumerate}");
        inNumberedList = false;
      }
      output2.push(line);
    }
  }

  if (inNumberedList) {
    output2.push("\\end{enumerate}");
  }

  processed = output2.join("\n");

  // Restore math and code
  processed = processed.replace(/__DISPLAYMATH_(\d+)__/g, (_, idx) => {
    const math = mathBlocks[parseInt(idx)];
    // $$...$$ → \[...\]
    return `\\[${math.slice(2, -2)}\\]`;
  });

  processed = processed.replace(/__INLINEMATH_(\d+)__/g, (_, idx) => {
    return mathBlocks[parseInt(idx)]; // Keep $...$
  });

  processed = processed.replace(/__CODE_(\d+)__/g, (_, idx) => {
    return mathBlocks[parseInt(idx)]; // Already \texttt{...}
  });

  return processed;
}
