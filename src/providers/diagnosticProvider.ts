import * as vscode from "vscode";
import {
  isYaziToml,
  parseSections,
  parseSectionOptions,
} from "../utils/tomlParser";
import { findSection, allSectionNames } from "../data/sections";

const DIAGNOSTIC_SOURCE = "Yazi Toolkit";

export class YaziDiagnosticProvider implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("yazi");

    // Validate on open and change
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((doc) => this.validate(doc)),
      vscode.workspace.onDidChangeTextDocument((e) =>
        this.validate(e.document),
      ),
      vscode.workspace.onDidCloseTextDocument((doc) =>
        this.diagnosticCollection.delete(doc.uri),
      ),
    );

    // Validate all open documents
    for (const doc of vscode.workspace.textDocuments) {
      this.validate(doc);
    }
  }

  validate(document: vscode.TextDocument): void {
    if (!isYaziToml(document)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const sections = parseSections(document);

    // Validate each section
    for (const section of sections) {
      this.validateSection(document, section, diagnostics);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private validateSection(
    document: vscode.TextDocument,
    section: { name: string; line: number; endLine: number },
    diagnostics: vscode.Diagnostic[],
  ): void {
    const sectionName = section.name;

    // Check if section is a known section
    // Allow opener.* sub-tables (e.g. [opener.edit], [opener.open])
    const isOpenerSub = sectionName.startsWith("opener.");
    const isOpenRules = sectionName === "open";
    const isKnown =
      allSectionNames.includes(sectionName) ||
      isOpenerSub;

    if (!isKnown) {
      const headerLine = document.lineAt(section.line).text;
      const bracketStart = headerLine.indexOf("[");
      const bracketEnd = headerLine.indexOf("]");
      const range = new vscode.Range(
        section.line,
        bracketStart,
        section.line,
        bracketEnd + 1,
      );
      diagnostics.push(
        this.createDiagnostic(
          range,
          `Unknown Yazi section: "${sectionName}"`,
          vscode.DiagnosticSeverity.Warning,
        ),
      );
      return;
    }

    // Skip key validation for opener sub-tables (they are user-defined)
    if (isOpenerSub) {
      return;
    }

    // Skip key validation for sections with no defined options (opener, confirm, select)
    const sectionDef = findSection(sectionName);
    if (!sectionDef || sectionDef.options.length === 0) {
      return;
    }

    const options = parseSectionOptions(document, section.line, section.endLine);

    for (const opt of options) {
      const knownOption = sectionDef.options.find((o) => o.name === opt.key);
      if (!knownOption) {
        const line = document.lineAt(opt.line).text;
        const keyStart = line.indexOf(opt.key);
        const range = new vscode.Range(
          opt.line,
          keyStart,
          opt.line,
          keyStart + opt.key.length,
        );
        diagnostics.push(
          this.createDiagnostic(
            range,
            `Unknown option "${opt.key}" in [${sectionName}]`,
            vscode.DiagnosticSeverity.Warning,
          ),
        );
        continue;
      }

      // Type checking
      this.validateValueType(
        document,
        opt.line,
        opt.key,
        opt.value,
        knownOption.type,
        diagnostics,
      );
    }
  }

  private validateValueType(
    document: vscode.TextDocument,
    line: number,
    key: string,
    value: string,
    expectedType: string,
    diagnostics: vscode.Diagnostic[],
  ): void {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;

    let actualType: string | null = null;

    if (trimmed === "true" || trimmed === "false") {
      actualType = "boolean";
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      actualType = "number";
    } else if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"""') || trimmed.startsWith("'''"))
    ) {
      actualType = "string";
    } else if (trimmed.startsWith("[")) {
      actualType = "array";
    } else if (trimmed.startsWith("{")) {
      actualType = "object";
    }

    if (actualType === null) return;

    // Check type mismatch
    const isCompatible =
      actualType === expectedType ||
      (expectedType === "object" && actualType === "array") ||
      (expectedType === "array" && actualType === "object");

    if (!isCompatible) {
      const lineText = document.lineAt(line).text;
      const valStart = lineText.indexOf(value);
      if (valStart < 0) return;
      const range = new vscode.Range(
        line,
        valStart,
        line,
        valStart + value.length,
      );
      diagnostics.push(
        this.createDiagnostic(
          range,
          `Type mismatch for "${key}": expected ${expectedType}, got ${actualType}`,
          vscode.DiagnosticSeverity.Error,
        ),
      );
    }
  }

  private createDiagnostic(
    range: vscode.Range,
    message: string,
    severity: vscode.DiagnosticSeverity,
  ): vscode.Diagnostic {
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = DIAGNOSTIC_SOURCE;
    return diagnostic;
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
