import * as vscode from "vscode";
import { YaziCompletionProvider } from "./providers/completionProvider";
import { YaziHoverProvider } from "./providers/hoverProvider";
import { YaziDiagnosticProvider } from "./providers/diagnosticProvider";

const TOML_SELECTOR: vscode.DocumentSelector = [
  { language: "toml", pattern: "**/yazi.toml" },
  { language: "toml", pattern: "**/keymap.toml" },
  { language: "toml", pattern: "**/theme.toml" },
];

export function activate(context: vscode.ExtensionContext): void {
  // Register completion provider
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      TOML_SELECTOR,
      new YaziCompletionProvider(),
      "[", // trigger on section header
      ".", // trigger for nested keys
      '"', // trigger inside strings
      "'", // trigger inside strings
      " ", // trigger for value tokens
    ),
  );

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      TOML_SELECTOR,
      new YaziHoverProvider(),
    ),
  );

  // Register diagnostics
  const diagnosticProvider = new YaziDiagnosticProvider();
  context.subscriptions.push(diagnosticProvider);

  // Log activation
  const outputChannel = vscode.window.createOutputChannel("Yazi Toolkit");
  outputChannel.appendLine("Yazi Toolkit activated");
  context.subscriptions.push(outputChannel);
}

export function deactivate(): void {
  // cleanup handled by disposables
}
