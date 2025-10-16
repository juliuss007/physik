import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "hast-util-sanitize";

function mergeAttributes(schema: Schema, tag: string, attrs: unknown[]) {
  const existing = (schema.attributes?.[tag] as unknown[]) ?? [];
  const merged = [...existing, ...attrs];
  return Array.from(new Set(merged.map((value) => JSON.stringify(value)))).map((value) =>
    JSON.parse(value)
  );
}

const baseSchema: Schema = {
  ...defaultSchema,
  attributes: { ...defaultSchema.attributes },
  tagNames: defaultSchema.tagNames ? [...defaultSchema.tagNames] : undefined
};

if (!baseSchema.attributes) {
  baseSchema.attributes = {};
}

baseSchema.attributes["*"] = mergeAttributes(baseSchema, "*", ["className", "style"]);
baseSchema.attributes.span = mergeAttributes(baseSchema, "span", [["className"], ["style"]]);
baseSchema.attributes.div = mergeAttributes(baseSchema, "div", [["className"], ["style"]]);
baseSchema.attributes.code = mergeAttributes(baseSchema, "code", [["className"], ["style"]]);
baseSchema.attributes.pre = mergeAttributes(baseSchema, "pre", [["className"], ["style"]]);

const allowedMathTags = [
  "math",
  "annotation",
  "semantics",
  "mrow",
  "mi",
  "mn",
  "mo",
  "ms",
  "mfrac",
  "msup",
  "msub",
  "msubsup",
  "mtable",
  "mtr",
  "mtd",
  "mspace",
  "mfenced",
  "mstyle",
  "menclose"
];

if (baseSchema.tagNames) {
  const set = new Set([...baseSchema.tagNames, ...allowedMathTags]);
  baseSchema.tagNames = Array.from(set);
}

export const markdownSanitizeSchema: Schema = baseSchema;
