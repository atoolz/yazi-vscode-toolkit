import * as assert from "assert";
import * as vscode from "vscode";
import { openYaziDoc } from "./helpers";

suite("Completion Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  });

  test("should provide section name completions", async () => {
    const content = "[\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(0, 1);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = [
        "manager",
        "preview",
        "opener",
        "open",
        "tasks",
        "plugin",
        "input",
        "which",
        "log",
      ];
      for (const section of expected) {
        assert.ok(
          labels.includes(section),
          `Should include section "${section}", got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("should provide options inside [manager] section", async () => {
    const content = "[manager]\n\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = [
        "sort_by",
        "sort_sensitive",
        "sort_reverse",
        "sort_dir_first",
        "show_hidden",
        "show_symlink",
        "scrolloff",
        "linemode",
      ];
      for (const opt of expected) {
        assert.ok(
          labels.includes(opt),
          `Should include option "${opt}" in [manager], got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("should provide sort_by value completions", async () => {
    const content = '[manager]\nsort_by = "';
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 11);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = ["alphabetical", "natural", "modified", "size"];
      for (const val of expected) {
        assert.ok(
          labels.includes(val),
          `Should include sort_by value "${val}", got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("should provide options inside [preview] section", async () => {
    const content = "[preview]\n\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = ["tab_size", "max_width", "max_height"];
      for (const opt of expected) {
        assert.ok(
          labels.includes(opt),
          `Should include option "${opt}" in [preview], got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("completions should have documentation", async () => {
    const content = "[manager]\n\n";
    const { uri, cleanup } = await openYaziDoc(content);
    try {
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
          undefined,
          10,
        );
      assert.ok(completions, "Completions should be returned");
      const sortByItem = completions.items.find((item) => {
        const label =
          typeof item.label === "string" ? item.label : item.label.label;
        return label === "sort_by";
      });
      assert.ok(sortByItem, 'Should find "sort_by" completion item');
      assert.ok(
        sortByItem.documentation || sortByItem.detail,
        '"sort_by" completion should have documentation or detail',
      );
    } finally {
      cleanup();
    }
  });
});
