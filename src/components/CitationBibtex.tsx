"use client";

import { useState } from "react";
import { BIBTEX } from "@/data/aw0";

export default function CitationBibtex() {
  const [copied, setCopied] = useState(false);
  if (!BIBTEX) return null;
  const bibtex = BIBTEX;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <div className="bibtex">
      <button aria-label="Copy BibTeX" className="bibtex__copy" onClick={copy} type="button">
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <pre>{bibtex}</pre>
    </div>
  );
}
