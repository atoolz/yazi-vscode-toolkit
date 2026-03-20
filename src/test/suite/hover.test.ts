import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { openYaziDoc, sleep, hoverToString } from "./helpers";

suite("Hover Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  });

  test("should show hover for section headers", async () => {
    const content = "[manager]\nsort_by = \"alphabetical\"\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(0, 3);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(hovers && hovers.length > 0, "Should return hover info");
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("manager"),
        `Hover should mention "manager", got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should show hover for keys inside sections", async () => {
    const content = "[manager]\nsort_by = \"alphabetical\"\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 3);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(hovers && hovers.length > 0, "Should return hover for key");
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("sort_by"),
        `Hover should mention "sort_by", got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should show hover for [preview] section options", async () => {
    const content = "[preview]\ntab_size = 2\nmax_width = 600\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 3);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(
        hovers && hovers.length > 0,
        "Should return hover for section option",
      );
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("tab_size"),
        `Hover should mention "tab_size", got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should NOT show hover for non-yazi content", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "yazi-test-"));
    const filePath = path.join(tmpDir, "other.toml");
    fs.writeFileSync(filePath, "key = 42\n", "utf8");
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
    await sleep(2000);
    try {
      const position = new vscode.Position(0, 1);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      const hasYaziHover =
        hovers &&
        hovers.some((h) => {
          const text = hoverToString([h]);
          return text.includes("Yazi") || text.includes("yazi");
        });
      assert.ok(
        !hasYaziHover,
        "Non-yazi files should not get yazi hover",
      );
    } finally {
      try {
        fs.unlinkSync(filePath);
        fs.rmdirSync(tmpDir);
      } catch {
        // ignore
      }
    }
  });
});
