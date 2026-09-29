"use client";

import { useState } from "react";

// TODO: replace with arXiv's exported BibTeX once the paper is posted.
const BIBTEX = `@article{liu2026aw0,
  title   = {Agentic World Action Model},
  author  = {Liu, Zhuoyang and Niu, Dantong and Zhang, Botong and Shao, Boning and Wang, Jing and Zheng, Ruijie and Sharma, Yuvan and Lu, Runyu and Liu, Jiaming and Zhang, Renrui and Herzig, Roei and Bai, Yutong and Goldberg, Ken and Xu, Danfei and Zhu, Yuke and Wang, Guanzhi and Fan, Linxi "Jim" and Darrell, Trevor},
  journal = {arXiv preprint},
  year    = {2026}
}`;

export default function CitationBibtex() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
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
      <pre>{BIBTEX}</pre>
    </div>
  );
}
