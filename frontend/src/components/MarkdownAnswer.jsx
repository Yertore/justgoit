import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/* preprocess (ваша существующая логика) */
function preprocess(raw) {
  if (!raw || typeof raw !== "string") return raw;
  let s = raw.replace(/\r\n/g, "\n");

  let scanStart = 0;
  while (true) {
    const pkgMatch = s.slice(scanStart).match(/(?:^|\n)\s*package\s+main\b/);
    if (!pkgMatch) break;
    const pkgIndex = scanStart + pkgMatch.index;
    const rest = s.slice(pkgIndex);
    const endMatch = rest.match(/\n\s*}\s*(?=\n|$)/);
    let endIndex;
    if (endMatch) {
      endIndex = pkgIndex + endMatch.index + endMatch[0].length;
    } else {
      const dbl = rest.search(/\n{2,}/);
      endIndex = dbl === -1 ? s.length : pkgIndex + dbl;
    }

    const snippet = s.slice(pkgIndex, endIndex);
    if (/```/.test(snippet)) {
      scanStart = endIndex;
      continue;
    }

    const trimmed = snippet.replace(/^\n+/, "").replace(/\n+$/, "");
    const fenced = "\n```go\n" + trimmed + "\n```\n";
    s = s.slice(0, pkgIndex) + fenced + s.slice(endIndex);
    scanStart = pkgIndex + fenced.length;
  }

  const parts = s.split(/(```[\s\S]*?```)/g);
  const codeLinePattern = /(?::=)|\b(var|const|type|func)\b|(?:[A-Za-z_][A-Za-z0-9_]*\.)+[A-Za-z_][A-Za-z0-9_]*\(/;

  for (let i = 0; i < parts.length; i += 2) {
    const lines = parts[i].split("\n");
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (!line || /^\s*$/.test(line)) continue;

      if (codeLinePattern.test(line)) {
        const hasCyrillic = /[А-Яа-яЁё]/.test(line);
        const hasAssign = /:=/.test(line);
        const hasImmediateCall = /(?:[A-Za-z_][A-Za-z0-9_]*\.)+[A-Za-z_][A-Za-z0-9_]*\(/.test(line);
        const startsWithKeyword = /^\s*(var|const|type|func)\b/.test(line);

        if (hasCyrillic && !hasAssign && !hasImmediateCall && !startsWithKeyword) {
          continue;
        }

        const trimmedLine = line.trim();
        lines[j] = "\n```go\n" + trimmedLine + "\n```\n";
      }
    }
    parts[i] = lines.join("\n");
  }

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

            // Важные props:
            // - customStyle: убирает фон/паддинг у контейнера, задаваемого библиотекой
            // - codeTagProps: снимает фон у внутреннего <code>
            // Эти два вместе гарантируют, что не останется "внутреннего белого прямоугольника".
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