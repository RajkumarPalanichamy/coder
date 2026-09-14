import * as XLSX from 'xlsx';

export const BATCH_SIZE = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEADER_ALIASES = {
  'first name': 'firstName',
  firstname: 'firstName',
  'last name': 'lastName',
  lastname: 'lastName',
  email: 'email',
  'email id': 'email',
  'email address': 'email',
};

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email'];

/**
 * Reads an uploaded workbook (first sheet) and normalizes it into student rows,
 * validating and separating out anything that can't be imported as-is.
 */
export function parseStudentWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rawRows.length === 0) {
    return { rows: [], skipped: [], totalRows: 0 };
  }

  const headerMap = {};
  Object.keys(rawRows[0]).forEach((key) => {
    const alias = HEADER_ALIASES[key.trim().toLowerCase()];
    if (alias) headerMap[key] = alias;
  });

  const foundFields = new Set(Object.values(headerMap));
  const missingFields = REQUIRED_FIELDS.filter((field) => !foundFields.has(field));
  if (missingFields.length > 0) {
    throw new Error(
      'The file is missing required column(s): First Name, Last Name, Email. Download the template for the expected format.'
    );
  }

  const rows = [];
  const skipped = [];
  const seenEmails = new Set();

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2; // header occupies row 1
    const normalized = {};
    Object.entries(raw).forEach(([key, value]) => {
      const field = headerMap[key];
      if (field) normalized[field] = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    });

    const { firstName, lastName, email } = normalized;

    if (!firstName || !lastName || !email) {
      skipped.push({ Row: rowNumber, Email: email || '', Reason: 'Missing first name, last name, or email' });
      return;
    }

    const lowerEmail = email.toLowerCase();
    if (!EMAIL_RE.test(lowerEmail)) {
      skipped.push({ Row: rowNumber, Email: email, Reason: 'Invalid email format' });
      return;
    }
    if (seenEmails.has(lowerEmail)) {
      skipped.push({ Row: rowNumber, Email: email, Reason: 'Duplicate email within file' });
      return;
    }

    seenEmails.add(lowerEmail);
    rows.push({ firstName, lastName, email: lowerEmail });
  });

  return { rows, skipped, totalRows: rawRows.length };
}

export function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
