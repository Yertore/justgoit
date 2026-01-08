import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/*
  MarkdownAnswer.jsx - safer/conservative preprocess
  - paragraph-based detector
  - buffer consecutive code-like paragraphs into one fenced block
  - COMMENTS (// ...) are treated as part of code
  - do NOT auto-wrap inline identifiers or normalize HTML wrappers (safer)
  - protect paragraphs that contain literal ``` or are pure inline-code like `Go`
  - refined brace detection: avoid treating identifier{} (e.g. interface{}) as code
*/

function preprocess(raw) {
  if (!raw || typeof raw !== "string") return raw;
  let s = raw.replace(/\r\n/g, "\n");

  // Split by existing fenced blocks and keep them intact.
  const parts = s.split(/(```[\s\S]*?```)/g);

  // Stripper to ignore strings/comments when checking braces/assignments
  function makeStripper() {
    let inBlockComment = false;
    return function strip(line) {
      let out = "";
      let inDouble = false;
      let inBacktick = false;
      for (let i = 0; i < line.length; i++) {
        if (!inDouble && !inBacktick && !inBlockComment && line[i] === "/" && line[i + 1] === "*") {
          inBlockComment = true;
          i++;
          continue;
        }
        if (inBlockComment && line[i] === "*" && line[i + 1] === "/") {
          inBlockComment = false;
          i++;
          continue;
        }
        if (inBlockComment) continue;
        if (!inDouble && !inBacktick && line[i] === "/" && line[i + 1] === "/") {
          break; // rest is comment
        }
        const ch = line[i];
        if (ch === '"' && !inBacktick) {
          inDouble = !inDouble;
          continue;
        }
        if (ch === "`" && !inDouble) {
          inBacktick = !inBacktick;
          continue;
        }
        if (!inDouble && !inBacktick && !inBlockComment) {
          out += ch;
        }
      }
      return out;
    };
  }
  const strip = makeStripper();

  const keywordRE = /^\s*(package|import|func|type|var|const|for|if|switch|return|struct)\b/;
  // conservative call regex: identifier( ...
  const callRE = /[A-Za-z_][A-Za-z0-9_]*\s*\(/;
  const simpleAssignRE = /:=/;
  const anyAssignRE = /[:=]=/;
  const hasCyrillic = (l) => /[А-Яа-яЁё]/.test(l);

  // helper: detect braces that are standalone (not directly indicative of an identifier{} token)
  function hasStandaloneBrace(s) {
    // If we see a direct identifier followed immediately by empty braces (like "interface{}" or "T{}"),
    // treat that pattern as non-decisive for "this is a code paragraph" (avoid false positives).
    // NOTE: this is a conservative heuristic — it avoids classifying "interface{}" as code.
    if (/\b[A-Za-z_][A-Za-z0-9_]*\{\}/.test(s)) return false;

    // Otherwise, consider braces standalone if '{' is not preceded by a word char,
    // or '}' is not followed by a word char. This catches typical code forms like "[]int{", "){", "} )", etc.
    return /(^|[^\w])\{/.test(s) || /\}([^\w]|$)/.test(s);
  }

  function isPureInlineCodeLine(line) {
    return /^\s*`[^`]+`\s*$/.test(line);
  }

  function isCodeLikeLine(line) {
    if (!line) return false;
    // don't treat pure inline `...` as code
    if (isPureInlineCodeLine(line)) return false;
    // treat single-line comment as code-like (keep with code)
    if (/^\s*\/\//.test(line)) return true;
    if (keywordRE.test(line)) return true;
    const stripped = strip(line);
    if (hasStandaloneBrace(stripped)) return true;
    if (simpleAssignRE.test(stripped)) return true; // ':='
    if (/\b[A-Za-z_][A-Za-z0-9_]*\s*=\s*/.test(stripped)) return true; // plain =
    if (callRE.test(stripped)) return true; // identifier( ...
    if (/^\s{2,}|\t/.test(line)) return true;
    if (anyAssignRE.test(stripped)) return true;
    if (/[;]$/.test(stripped.trim())) return true;
    return false;
  }

  // Process non-fenced parts by paragraphs, buffer consecutive code-like paragraphs
  for (let p = 0; p < parts.length; p += 2) {
    const block = parts[p];
    if (!block) {
      parts[p] = block;
      continue;
    }

    const lines = block.split("\n");
    const out = [];
    let i = 0;
    let codeBuffer = null;

    while (i < lines.length) {
      // Blank line
      if (/^\s*$/.test(lines[i])) {
        if (codeBuffer !== null) {
          // Don't push a separator here — we will insert exactly one separator
          // when we append the next code paragraph. Just skip the blank line.
          i++;
          continue;
        } else {
          out.push(lines[i]);
          i++;
          continue;
        }
      }

      // collect paragraph (consecutive non-blank lines)
      const start = i;
      while (i < lines.length && !/^\s*$/.test(lines[i])) i++;
      const paraLines = lines.slice(start, i);

      // If paragraph contains literal fenced marker, treat as plain paragraph (do not include into buffer)
      const containsFenceMarker = paraLines.some((L) => /```/.test(L));
      if (containsFenceMarker) {
        if (codeBuffer !== null) {
          out.push("```go");
          out.push(...codeBuffer);
          out.push("```");
          codeBuffer = null;
        }
        out.push(...paraLines);
        continue;
      }

      // Don't treat paragraphs that are ONLY pure inline-code lines as code
      const allPureInline = paraLines.every((L) => isPureInlineCodeLine(L));
      if (allPureInline) {
        if (codeBuffer !== null) {
          out.push("```go");
          out.push(...codeBuffer);
          out.push("```");
          codeBuffer = null;
        }
        out.push(...paraLines);
        continue;
      }

      // analyze paragraph: count code-like lines
      let codeLikeCount = 0;
      let strongCount = 0;
      let anyCyr = false;
      for (const L of paraLines) {
        const stripped = strip(L);
        if (isCodeLikeLine(L)) codeLikeCount++;
        if (keywordRE.test(L) || simpleAssignRE.test(stripped) || callRE.test(stripped) || hasStandaloneBrace(stripped)) strongCount++;
        if (hasCyrillic(L)) anyCyr = true;
      }

      const len = paraLines.length;
      const codeLikeRatio = len ? codeLikeCount / len : 0;

      let isCodePara = false;
      if (keywordRE.test(paraLines[0])) {
        isCodePara = true;
      } else if (strongCount > 0) {
        isCodePara = true;
      } else if (codeLikeCount >= 2 && (strongCount >= 1 || codeLikeRatio >= 0.6 || len >= 4)) {
        isCodePara = true;
      } else {
        isCodePara = false;
      }
      if (anyCyr && strongCount === 0) {
        isCodePara = false;
      }

      if (isCodePara) {
        if (codeBuffer === null) codeBuffer = [];
        if (codeBuffer.length > 0) codeBuffer.push("");
        codeBuffer.push(...paraLines);
      } else {
        if (codeBuffer !== null) {
          out.push("```go");
          out.push(...codeBuffer);
          out.push("```");
          codeBuffer = null;
        }
        out.push(...paraLines);
      }
    }

    if (codeBuffer !== null) {
      out.push("```go");
      out.push(...codeBuffer);
      out.push("```");
      codeBuffer = null;
    }

    parts[p] = out.join("\n");
  }

  // Reassemble text
  s = parts.join("");

  return s;
}

export default function MarkdownAnswer({ content }) {
  const processed = preprocess(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const lang = match ? match[1] : undefined;
          const raw = String(children);

          if (!inline) {
            const codeText = raw.replace(/\n$/, "");
            return (
              <SyntaxHighlighter
                style={oneLight}
                language={lang}
                PreTag="div"
                customStyle={{
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  boxShadow: "none",
                }}
                codeTagProps={{
                  style: {
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                  },
                }}
              >
                {codeText}
              </SyntaxHighlighter>
            );
          } else {
            return <code className="inline-code">{raw}</code>;
          }
        },
      }}
    >
      {processed}
    </ReactMarkdown>
  );
}