
export type ContentType = 'movie' | 'series';

export interface ContentItem {
  id: string;
  title: string;
  year: string;
  category: string;
  rating: string;
  type: ContentType;
  seasons?: number;
  description: string;
  poster: string;
  telegramLink: string;
  status: 'active' | 'inactive';
  customNote?: string;
}

export interface SheetRow {
  title: string;
  type: ContentType;
  year: string;
  rating: string;
  genres: string;
  description: string;
  telegram: string;
  poster: string;
  status?: string; // Optional: for internal filtering
}

declare global {
  interface Window {
    Telegram: any;
    show_10331054: () => Promise<void>;
  }
}
