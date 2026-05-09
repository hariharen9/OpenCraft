export interface DocumentPayload {
  json: unknown;
  markdown: string;
  updatedAt: number;
}

export interface StorageProvider {
  load(id: string): Promise<DocumentPayload | null>;
  save(id: string, payload: DocumentPayload): Promise<void>;
  remove(id: string): Promise<void>;
}
