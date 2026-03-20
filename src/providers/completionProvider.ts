import * as vscode from "vscode";
import { getTomlContext, isYaziToml } from "../utils/tomlParser";
import { yaziSections, findSection, allSectionNames, knownEnumValues } from "../data/sections";

export class YaziCompletionProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): vscode.CompletionItem[] | undefined {
    if (!isYaziToml(document)) {
      return undefined;
    }

    const ctx = getTomlContext(document, position);
    const lineText = document.lineAt(position.line).text;

    // Section header completion: user is typing [...]
    if (lineText.trim().startsWith("[")) {
      return this.completeSectionHeader(lineText, position);
    }

    // Inside a value
    if (ctx.inValue) {
      return this.completeValue(ctx);
    }

    // Key completion
    return this.completeKey(ctx);
  }

  private completeSectionHeader(
    _lineText: string,
    _position: vscode.Position,
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const sectionName of allSectionNames) {
      const section = findSection(sectionName);
      if (!section) continue;

      const item = new vscode.CompletionItem(
        sectionName,
        vscode.CompletionItemKind.Module,
      );
      item.detail = "Yazi section";
      item.documentation = new vscode.MarkdownString(
        `${section.description}\n\n[Documentation](${section.docUrl})`,
      );
      items.push(item);
    }

    return items;
  }

  private completeKey(ctx: { section: string }): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    if (ctx.section === "") {
      // No top-level options for yazi.toml outside sections
      return items;
    }

    const section = findSection(ctx.section);
    if (section) {
      for (const opt of section.options) {
        const item = new vscode.CompletionItem(
          opt.name,
          vscode.CompletionItemKind.Property,
        );
        item.detail = `${opt.type} (default: ${opt.default})`;
        item.documentation = new vscode.MarkdownString(opt.description);
        item.insertText = this.keyValueSnippet(opt.name, opt.type, opt.default);
        items.push(item);
      }
    }

    return items;
  }

  private completeValue(
    ctx: {
      section: string;
      currentKey: string;
      currentValue: string;
      inString: boolean;
    },
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const key = ctx.currentKey;

    // Enum value completions for known keys
    if (knownEnumValues[key]) {
      for (const val of knownEnumValues[key]) {
        const item = new vscode.CompletionItem(
          val,
          vscode.CompletionItemKind.EnumMember,
        );
        item.detail = `Value for ${key}`;
        if (!ctx.inString) {
          item.insertText = `"${val}"`;
        }
        items.push(item);
      }
      return items;
    }

    // Boolean completions
    const section = findSection(ctx.section);
    if (section) {
      const optionDef = section.options.find((o) => o.name === key);
      if (optionDef?.type === "boolean") {
        items.push(
          new vscode.CompletionItem("true", vscode.CompletionItemKind.Value),
          new vscode.CompletionItem("false", vscode.CompletionItemKind.Value),
        );
      }
    }

    return items;
  }

  private keyValueSnippet(
    name: string,
    type: string,
    defaultValue: string,
  ): vscode.SnippetString {
    switch (type) {
      case "string":
        return new vscode.SnippetString(
          `${name} = "\${1:${defaultValue.replace(/^"|"$/g, "")}}"`,
        );
      case "boolean":
        return new vscode.SnippetString(
          `${name} = \${1|true,false|}`,
        );
      case "number":
        return new vscode.SnippetString(
          `${name} = \${1:${defaultValue}}`,
        );
      case "array":
        return new vscode.SnippetString(`${name} = [\${1}]`);
      case "object":
        return new vscode.SnippetString(`${name} = \${1:{}}`);
      default:
        return new vscode.SnippetString(`${name} = \${1:${defaultValue}}`);
    }
  }
}
