// src/services/fileService.ts
import * as XLSX from 'xlsx';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import type { Contact } from '../types';

export class FileService {
  static async saveUploadedFile(buffer: Uint8Array, filename: string): Promise<string> {
    const filePath = join('./uploads', filename);
    await writeFile(filePath, buffer);
    return filePath;
  }

  static async parseExcelFile(filePath: string): Promise<Contact[]> {
    const buffer = await readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map((row: any) => ({
      Email: row.Email || row.email || '',
      FirstName: row.FirstName || row['First Name'] || row.firstname || '',
      LastName: row.LastName || row['Last Name'] || row.lastname || '',
      Company: row.Company || row.company || '',
      ...row
    }));
  }

  static async readHTMLTemplate(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    return buffer.toString('utf-8');
  }
}
