import * as assert from "assert";
import * as vscode from "vscode";
import { openYaziDoc, sleep } from "./helpers";

suite("Diagnostics Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await sleep(500);
  });

  test("should warn about unknown sections", async () => {
    const content = "[nonexistent_section]\ndisabled = false\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const unknownSection = diagnostics.find(
        (d) =>
          d.message.includes("Unknown Yazi section") &&
          d.message.includes("nonexistent_section"),
      );
      assert.ok(
        unknownSection,
        `Should warn about unknown section, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        unknownSection.severity,
        vscode.DiagnosticSeverity.Warning,
      );
    } finally {
      cleanup();
    }
  });

  test("should warn about unknown options within known sections", async () => {
    const content = "[manager]\nunknown_option = true\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const unknownOpt = diagnostics.find(
        (d) =>
          d.message.includes("Unknown option") &&
          d.message.includes("unknown_option"),
      );
      assert.ok(
        unknownOpt,
        `Should warn about unknown option, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        unknownOpt.severity,
        vscode.DiagnosticSeverity.Warning,
      );
    } finally {
      cleanup();
    }
  });

  test("valid config should produce zero diagnostics", async () => {
    const content = [
      "[manager]",
      'sort_by = "alphabetical"',
      "sort_sensitive = false",
      "sort_reverse = false",
      "sort_dir_first = true",
      "show_hidden = false",
      "show_symlink = true",
      "scrolloff = 5",
      "",
      "[preview]",
      "tab_size = 2",
      "max_width = 600",
      "max_height = 900",
    ].join("\n");
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.strictEqual(
        diagnostics.length,
        0,
        `Valid config should have 0 diagnostics, got ${diagnostics.length}: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should report multiple errors in one file", async () => {
    const content = [
      "[nonexistent_section]",
      "disabled = false",
      "",
      "[manager]",
      "unknown_option = true",
    ].join("\n");
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.ok(
        diagnostics.length >= 2,
        `Should report at least 2 diagnostics, got ${diagnostics.length}: ${diagnostics.map((d) => d.message).join("; ")}`,
      );

      const hasUnknownSection = diagnostics.some((d) =>
        d.message.includes("Unknown Yazi section"),
      );
      const hasUnknownOpt = diagnostics.some((d) =>
        d.message.includes("Unknown option"),
      );

      assert.ok(hasUnknownSection, "Should have unknown section warning");
      assert.ok(hasUnknownOpt, "Should have unknown option warning");
    } finally {
      cleanup();
    }
  });

  test("should report type mismatches", async () => {
    const content = "[manager]\nscrolloff = \"abc\"\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const typeMismatch = diagnostics.find((d) =>
        d.message.includes("Type mismatch"),
      );
      assert.ok(
        typeMismatch,
        `Should report type mismatch, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        typeMismatch.severity,
        vscode.DiagnosticSeverity.Error,
      );
    } finally {
      cleanup();
    }
  });
});
