import { markdownToLatex } from "@/lib/markdownToLatex";

describe("markdownToLatex", () => {
  it("converts headings, lists, formatting and escapes plain text safely", () => {
    const input = [
      "# Kapitel",
      "Ein **wichtiger** Satz mit 50% Erfolg und _Fokus_.",
      "- Punkt 1",
      "- Punkt 2"
    ].join("\n");

    const output = markdownToLatex(input);

    expect(output).toContain("\\section*{Kapitel}");
    expect(output).toContain("\\textbf{wichtiger}");
    expect(output).toContain("\\textit{Fokus}");
    expect(output).toContain("50\\% Erfolg");
    expect(output).toContain("\\begin{itemize}");
    expect(output).toContain("\\item Punkt 1");
  });

  it("keeps multiline inline math and display math without placeholders", () => {
    const input = [
      "Inline: $a +",
      "b = c$",
      "",
      "$$",
      "\\int_0^1 x^2 dx",
      "$$"
    ].join("\n");

    const output = markdownToLatex(input);

    expect(output).toContain("\\(a +\nb = c\\)");
    expect(output).toContain("\\[\n\\int_0^1 x^2 dx\n\\]");
    expect(output).not.toMatch(/XMATHBLK(?:DISP|INLN)\d+ENDX/);
  });
});
