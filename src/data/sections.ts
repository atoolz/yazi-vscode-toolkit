export interface SectionOption {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  default: string;
  description: string;
}

export interface YaziSection {
  name: string;
  description: string;
  docUrl: string;
  options: SectionOption[];
}

const BASE_DOC_URL = "https://yazi-rs.github.io/docs/configuration/yazi";

export const yaziSections: YaziSection[] = [
  // [manager]
  {
    name: "manager",
    description: "File manager behavior and display settings.",
    docUrl: `${BASE_DOC_URL}#manager`,
    options: [
      { name: "ratio", type: "array", default: "[1, 4, 3]", description: "Layout ratio for the three panes (parent, current, preview)." },
      { name: "sort_by", type: "string", default: '"alphabetical"', description: "Sort method. One of: alphabetical, created, modified, natural, size, random." },
      { name: "sort_sensitive", type: "boolean", default: "false", description: "Case sensitive sorting." },
      { name: "sort_reverse", type: "boolean", default: "false", description: "Reverse the sort order." },
      { name: "sort_dir_first", type: "boolean", default: "true", description: "Show directories before files." },
      { name: "sort_translit", type: "boolean", default: "false", description: "Transliterate filenames for sorting (e.g. treat accented chars as ASCII)." },
      { name: "linemode", type: "string", default: '"none"', description: "Line mode for file entries. One of: none, size, permissions, mtime, owner." },
      { name: "show_hidden", type: "boolean", default: "false", description: "Show hidden files (dotfiles)." },
      { name: "show_symlink", type: "boolean", default: "true", description: "Show symlink targets in the status bar." },
      { name: "scrolloff", type: "number", default: "5", description: "Number of lines to keep visible above/below the cursor." },
      { name: "mouse_events", type: "array", default: '["click", "scroll"]', description: "Mouse events to handle. Possible values: click, scroll." },
      { name: "title_format", type: "string", default: '"Yazi: {cwd}"', description: "Format string for the terminal title. {cwd} is replaced with the current directory." },
    ],
  },

  // [preview]
  {
    name: "preview",
    description: "File preview settings including dimensions and caching.",
    docUrl: `${BASE_DOC_URL}#preview`,
    options: [
      { name: "tab_size", type: "number", default: "2", description: "Tab display width in the preview pane." },
      { name: "max_width", type: "number", default: "600", description: "Maximum width of preview images in pixels." },
      { name: "max_height", type: "number", default: "900", description: "Maximum height of preview images in pixels." },
      { name: "cache_name", type: "string", default: '""', description: "Cache directory name for previews. Empty string uses default." },
      { name: "ueberzug_scale", type: "number", default: "1", description: "Scale factor for Ueberzug image previews." },
      { name: "ueberzug_offset", type: "array", default: "[0, 0, 0, 0]", description: "Offset for Ueberzug image previews [x, y, width, height]." },
    ],
  },

  // [opener]
  {
    name: "opener",
    description: "File openers define commands to open files. Each key is an opener name containing an array of opener rules.",
    docUrl: `${BASE_DOC_URL}#opener`,
    options: [],
  },

  // [open]
  {
    name: "open",
    description: "Open rules that map file types to openers.",
    docUrl: `${BASE_DOC_URL}#open`,
    options: [
      { name: "rules", type: "array", default: "[]", description: "Array of open rules. Each rule has name, use (opener names), and optional mime/dir filters." },
    ],
  },

  // [tasks]
  {
    name: "tasks",
    description: "Task manager settings for background operations.",
    docUrl: `${BASE_DOC_URL}#tasks`,
    options: [
      { name: "micro_workers", type: "number", default: "10", description: "Number of workers for micro tasks (file operations)." },
      { name: "macro_workers", type: "number", default: "25", description: "Number of workers for macro tasks (directory operations)." },
      { name: "bizarre_retry", type: "number", default: "5", description: "Number of retries for failed tasks." },
      { name: "image_alloc", type: "number", default: "536870912", description: "Maximum memory allocation for image previews in bytes (default 512MB)." },
      { name: "image_bound", type: "array", default: "[0, 0]", description: "Maximum image dimensions [width, height]. 0 means unlimited." },
      { name: "suppress_preload", type: "boolean", default: "false", description: "Suppress preloading of files when entering a directory." },
    ],
  },

  // [plugin]
  {
    name: "plugin",
    description: "Plugin configuration for custom previewers, preloaders, and fetchers.",
    docUrl: `${BASE_DOC_URL}#plugin`,
    options: [
      { name: "prepend_previewers", type: "array", default: "[]", description: "Custom previewers added before built-in ones. Each entry has name, run, and mime/ext." },
      { name: "append_previewers", type: "array", default: "[]", description: "Custom previewers added after built-in ones. Each entry has name, run, and mime/ext." },
      { name: "prepend_preloaders", type: "array", default: "[]", description: "Custom preloaders added before built-in ones. Each entry has name, run, and mime/ext." },
      { name: "append_preloaders", type: "array", default: "[]", description: "Custom preloaders added after built-in ones. Each entry has name, run, and mime/ext." },
      { name: "prepend_fetchers", type: "array", default: "[]", description: "Custom fetchers added before built-in ones. Each entry has id, name, run, and mime/ext." },
      { name: "append_fetchers", type: "array", default: "[]", description: "Custom fetchers added after built-in ones. Each entry has id, name, run, and mime/ext." },
    ],
  },

  // [input]
  {
    name: "input",
    description: "Input dialog settings for text prompts (rename, create, etc.).",
    docUrl: `${BASE_DOC_URL}#input`,
    options: [
      { name: "cursor_blink", type: "boolean", default: "false", description: "Enable cursor blinking in input dialogs." },
    ],
  },

  // [confirm]
  {
    name: "confirm",
    description: "Confirm dialog settings for destructive operations.",
    docUrl: `${BASE_DOC_URL}#confirm`,
    options: [],
  },

  // [select]
  {
    name: "select",
    description: "Select dialog settings for choosing from a list of options.",
    docUrl: `${BASE_DOC_URL}#select`,
    options: [],
  },

  // [which]
  {
    name: "which",
    description: "Which-key popup settings, displayed when a key sequence is ambiguous.",
    docUrl: `${BASE_DOC_URL}#which`,
    options: [
      { name: "sort_by", type: "string", default: '"none"', description: "Sort method for which-key entries. One of: none, key, desc." },
      { name: "sort_sensitive", type: "boolean", default: "false", description: "Case sensitive sorting in which-key popup." },
      { name: "sort_reverse", type: "boolean", default: "false", description: "Reverse the sort order in which-key popup." },
      { name: "sort_translit", type: "boolean", default: "false", description: "Transliterate for sorting in which-key popup." },
    ],
  },

  // [log]
  {
    name: "log",
    description: "Logging settings for debugging.",
    docUrl: `${BASE_DOC_URL}#log`,
    options: [
      { name: "enabled", type: "boolean", default: "false", description: "Enable logging to a file." },
    ],
  },
];

/**
 * All known section names.
 */
export const allSectionNames: string[] = yaziSections.map((s) => s.name);

/**
 * Find a section by name.
 */
export function findSection(name: string): YaziSection | undefined {
  return yaziSections.find((s) => s.name === name);
}

/**
 * Known enum values for specific keys, used for value completions.
 */
export const knownEnumValues: Record<string, string[]> = {
  sort_by: ["alphabetical", "created", "modified", "natural", "size", "random"],
  linemode: ["none", "size", "permissions", "mtime", "owner"],
};
