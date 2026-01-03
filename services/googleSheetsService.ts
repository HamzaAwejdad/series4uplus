
import { GOOGLE_SHEET_ID } from '../constants';
import { SheetRow } from '../types';

export const fetchSheetData = async (retryCount = 0): Promise<SheetRow[]> => {
  if (!GOOGLE_SHEET_ID) return [];

  const MAX_RETRIES = 3;

  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'text/csv' }
    });

    if (!response.ok) throw new Error(`FAILED: ${response.status}`);
    
    const csvText = await response.text();
    
    const parseCSVLine = (line: string) => {
      const result = [];
      let curValue = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            curValue += '"';
            i++;
          } else { inQuotes = !inQuotes; }
        } else if (char === ',' && !inQuotes) {
          result.push(curValue.trim());
          curValue = "";
        } else { curValue += char; }
      }
      result.push(curValue.trim());
      return result;
    };

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    return lines.slice(1).map((line) => {
      const cells = parseCSVLine(line);
      
      let rawLink = (cells[6] || '').trim();
      
      // ROBUST URL SANITIZATION
      if (rawLink) {
        if (rawLink.startsWith('https://t.me/') || rawLink.startsWith('http://t.me/')) {
          // Already correct
        } else if (rawLink.startsWith('t.me/')) {
          rawLink = `https://${rawLink}`;
        } else if (rawLink.startsWith('@')) {
          rawLink = `https://t.me/${rawLink.substring(1)}`;
        } else if (!rawLink.startsWith('http')) {
          // Plain username or channel ID
          rawLink = `https://t.me/${rawLink}`;
        }
      }

      return {
        title: (cells[0] || '').trim(),
        type: (cells[1]?.toLowerCase().includes('series') ? 'series' : 'movie') as any,
        year: (cells[2] || '').trim(),
        rating: (cells[3] || '').trim(),
        genres: (cells[4] || '').trim(),
        description: (cells[5] || '').trim(),
        telegram: rawLink || 'https://t.me/Series4UplusOfficial',
        poster: (cells[7] || '').trim()
      } as SheetRow;
    }).filter(row => row.title.length > 0);

  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 2000));
      return fetchSheetData(retryCount + 1);
    }
    throw error;
  }
};
