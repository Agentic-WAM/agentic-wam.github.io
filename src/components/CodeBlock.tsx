import { highlightPythonLine } from "@/lib/pythonHighlight";

// A read-only Python listing with line numbers and light syntax colouring.
export default function CodeBlock({ code, title, className }: { code: string; title?: string; className?: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className={`code-block${className ? ` ${className}` : ""}`}>
      {title ? <div className="code-block__title">{title}</div> : null}
      <pre>
        {lines.map((line, i) => (
          <div className="code-line" key={i}>
            <span className="code-line__no">{i + 1}</span>
            <span className="code-line__text">{highlightPythonLine(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
