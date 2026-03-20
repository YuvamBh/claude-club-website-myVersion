"use client";

import { useState } from "react";
import { Upload, CheckCircle2, Loader2, X } from "lucide-react";

interface ImportResult {
  email: string;
  name: string;
  status: "imported" | "exists" | "error" | "duplicate";
  message?: string;
}

interface ParsedRow {
  name: string;
  email: string;
  year?: string;
  major?: string;
  github?: string;
}

export function ImportClient() {
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [parseError, setParseError] = useState("");

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return [];

    // Detect delimiter
    const firstLine = lines[0];
    const delim = firstLine.includes("\t") ? "\t" : ",";

    const splitLine = (line: string) =>
      line.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, "$1").trim());

    // Detect header row
    const firstLower = firstLine.toLowerCase();
    const hasHeader =
      firstLower.includes("email") ||
      firstLower.includes("name") ||
      firstLower.includes("first") ||
      firstLower.includes("major") ||
      firstLower.includes("year");

    const headerCols = hasHeader ? splitLine(lines[0]).map((h) => h.toLowerCase()) : [];
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Map header names to column indices
    const idx = {
      firstName: headerCols.findIndex((h) => h.includes("first")),
      lastName: headerCols.findIndex((h) => h.includes("last")),
      email: headerCols.findIndex((h) => h.includes("email")),
      year: headerCols.findIndex((h) => h === "year" || h.includes("year")),
      major: headerCols.findIndex((h) => h === "major" || h.includes("major")),
      github: headerCols.findIndex((h) => h.includes("github")),
    };

    const parsed: ParsedRow[] = [];

    for (const line of dataLines) {
      if (!line.trim()) continue;
      const cols = splitLine(line);

      // Find email
      let email = "";
      if (idx.email >= 0) {
        email = (cols[idx.email] ?? "").toLowerCase().trim();
      } else {
        // fallback: find column with @
        const found = cols.findIndex((c) => c.includes("@"));
        if (found >= 0) email = cols[found].toLowerCase().trim();
      }
      if (!email || !email.includes("@")) continue;

      // Build name
      let name = "";
      if (idx.firstName >= 0 && idx.lastName >= 0) {
        name = `${cols[idx.firstName] ?? ""} ${cols[idx.lastName] ?? ""}`.trim();
      } else if (idx.firstName >= 0) {
        name = (cols[idx.firstName] ?? "").trim();
      } else if (hasHeader) {
        // join all non-email, non-year, non-major, non-github cols
        name = cols
          .filter((_, i) => i !== idx.email && i !== idx.year && i !== idx.major && i !== idx.github)
          .slice(0, 2)
          .join(" ")
          .trim();
      } else {
        const others = cols.filter((c) => !c.includes("@")).slice(0, 2);
        name = others.join(" ").trim();
      }
      if (!name) name = email.split("@")[0];

      const row: ParsedRow = { name, email };
      if (idx.year >= 0 && cols[idx.year]) row.year = cols[idx.year];
      if (idx.major >= 0 && cols[idx.major]) row.major = cols[idx.major];
      if (idx.github >= 0 && cols[idx.github]) row.github = cols[idx.github];

      parsed.push(row);
    }

    return parsed;
  }

  async function handleImport() {
    setParseError("");
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      setParseError("No valid rows found. Make sure the data includes an email column.");
      return;
    }

    setImporting(true);
    setResults(null);

    const res = await fetch("/api/hackathon2.0/import-participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants: rows }),
    });

    const json = await res.json();
    if (json.error) {
      setParseError(`Server error: ${json.error}`);
      setImporting(false);
      return;
    }
    const returned = json.results ?? [];
    // Find duplicate emails within the sheet itself (same email submitted twice)
    const seenEmails = new Set<string>();
    const duplicates: ImportResult[] = [];
    for (const r of rows) {
      if (seenEmails.has(r.email)) {
        duplicates.push({ ...r, status: "duplicate", message: "Duplicate entry in sheet - only imported once" });
      } else {
        seenEmails.add(r.email);
      }
    }
    // Cross-check: find rows not duplicates and not returned by server
    const returnedEmails = new Set(returned.map((r: ImportResult) => r.email));
    const missing = rows
      .filter((r) => !seenEmails.has(r.email) === false && !returnedEmails.has(r.email))
      .filter((r, idx, arr) => arr.findIndex((x) => x.email === r.email) === idx) // dedupe
      .map((r) => ({
        ...r,
        status: "error" as const,
        message: "Not processed by server - re-import to retry",
      }));
    setResults([...returned, ...duplicates, ...missing]);
    setImporting(false);
  }

  const preview = csvText.trim() ? parseCSV(csvText) : [];
  const importedCount = results?.filter((r) => r.status === "imported").length ?? 0;
  const existsCount = results?.filter((r) => r.status === "exists").length ?? 0;
  const errorCount = results?.filter((r) => r.status === "error").length ?? 0;
  const duplicateCount = results?.filter((r) => r.status === "duplicate").length ?? 0;

  return (
    <div className="max-w-2xl space-y-5">
      {/* Paste area */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-white/60">Paste sheet data</label>
          {csvText && (
            <button
              onClick={() => { setCsvText(""); setResults(null); }}
              className="text-xs text-white/30 hover:text-white/50 flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <textarea
          value={csvText}
          onChange={(e) => { setCsvText(e.target.value); setResults(null); }}
          placeholder={"First Name\tLast Name\tEmail\tYear\tMajor\tGitHub\nJohn\tDoe\tjohn.doe@asu.edu\tJunior\tCS\tgithub.com/jdoe"}
          rows={8}
          className="w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/70 placeholder-white/15 font-mono focus:outline-none focus:border-[#ff9b7a]/30 resize-none"
        />

        {preview.length > 0 && !results && (
          <p className="mt-2 text-xs text-white/40">
            <span className="text-[#ff9b7a]">{preview.length}</span> participants detected -{" "}
            {preview.slice(0, 3).map((p) => p.email).join(", ")}
            {preview.length > 3 ? "…" : ""}
          </p>
        )}
        {parseError && <p className="mt-2 text-xs text-red-400">{parseError}</p>}
      </div>

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!csvText.trim() || importing}
        className="w-full flex items-center justify-center gap-2.5 bg-[#ff9b7a] hover:bg-[#ffb89e] disabled:opacity-40 text-[#1a1a1a] font-semibold rounded-xl py-3.5 text-sm transition-colors"
      >
        {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {importing
          ? `Importing ${preview.length} participants…`
          : `Import ${preview.length > 0 ? preview.length : ""} Participants`}
      </button>

      {/* Results */}
      {results && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 space-y-5">
          {/* Summary */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 text-green-400">
              <CheckCircle2 size={14} /> {importedCount} new imported
            </span>
            {existsCount > 0 && (
              <span className="text-white/40">{existsCount} already in DB (updated)</span>
            )}
            {duplicateCount > 0 && (
              <span className="text-yellow-400/70">{duplicateCount} duplicates in sheet</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-400">✗ {errorCount} not added</span>
            )}
          </div>

          {/* Not Added to DB */}
          {errorCount > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-red-400">
                  ✗ Not Added to DB ({errorCount})
                </p>
                <p className="text-xs text-red-400/50">These people were not saved - re-import to retry</p>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {results.filter((r) => r.status === "error").map((r, i) => (
                  <div key={i} className="flex items-start justify-between text-xs py-1.5 border-b border-red-500/10 last:border-0 gap-4">
                    <div>
                      <p className="text-white/70 font-medium">{r.name}</p>
                      <p className="text-white/40">{r.email}</p>
                    </div>
                    <span className="text-red-400/70 text-right shrink-0 max-w-[200px]">{r.message ?? "Unknown error"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicates in sheet */}
          {duplicateCount > 0 && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-yellow-400">
                  ⚠ Duplicate entries in sheet ({duplicateCount})
                </p>
                <p className="text-xs text-yellow-400/50">Same email appeared twice - only imported once</p>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {results!.filter((r) => r.status === "duplicate").map((r, i) => (
                  <div key={i} className="flex items-start justify-between text-xs py-1.5 border-b border-yellow-500/10 last:border-0 gap-4">
                    <div>
                      <p className="text-white/70 font-medium">{r.name}</p>
                      <p className="text-white/40">{r.email}</p>
                    </div>
                    <span className="text-yellow-400/60 text-right shrink-0">Duplicate</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already existed */}
          {existsCount > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/30 mb-2">Already in DB - updated ({existsCount})</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {results.filter((r) => r.status === "exists").map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-white/40">{r.name} <span className="text-white/20">({r.email})</span></span>
                    <span className="text-white/20 font-medium">Updated</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly imported */}
          {importedCount > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-400/60 mb-2">Newly imported ({importedCount})</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {results.filter((r) => r.status === "imported").map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-white/60">{r.name} <span className="text-white/30">({r.email})</span></span>
                    <span className="text-green-400 font-medium">✓ Imported</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
