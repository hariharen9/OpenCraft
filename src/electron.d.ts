interface Window {
  electronAPI?: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    onMaximized: (cb: (isMax: boolean) => void) => void;
    readFile: (name: string) => Promise<string | null>;
    writeFile: (name: string, content: string) => Promise<boolean>;
    deleteFile: (name: string) => Promise<boolean>;
    listFiles: () => Promise<string[]>;
    notify: (title: string, body: string) => Promise<void>;
    onQuickSearch: (cb: () => void) => void;
  }
}
