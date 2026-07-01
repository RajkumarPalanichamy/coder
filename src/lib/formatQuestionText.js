/**
 * Normalize MCQ question/option text for display.
 * Legacy admin used single-line inputs, so pasted code was stored with spaces instead of newlines.
 */
const INDENT = '    ';

export function formatQuestionText(text) {
  if (!text || typeof text !== 'string') return text;
  if (text.includes('\n')) return text;

  const looksLikeSquashedCode =
    /\b(def|class|for|while|if|return|import)\b/.test(text) && /\s{2,}/.test(text);

  if (!looksLikeSquashedCode) return text;

  let formatted = text.split(/\s{2,}/).join('\n');
  formatted = formatted.replace(/([^\n])\s+(def |class )/g, '$1\n$2');

  return indentCodeLines(formatted.split('\n').map((line) => line.trim()).filter(Boolean));
}

function indentCodeLines(lines) {
  return lines
    .map((line) => {
      if (/^(what|wht)\b/i.test(line) || /^[A-Za-z].*\?$/.test(line)) {
        return line;
      }
      if (/^(def|class)\b/.test(line)) return line;
      if (/^(import|from)\b/.test(line)) return line;
      if (/^return\b/.test(line)) return INDENT + line;
      if (/^(for|while)\b/.test(line)) return INDENT + line;
      if (/^(if|elif|else)\b/.test(line)) return INDENT.repeat(2) + line;
      if (/^candidate = num\b/.test(line)) return INDENT.repeat(3) + line;
      if (/^count \+=/.test(line)) return INDENT.repeat(2) + line;
      if (/^(candidate|count)\s*=/.test(line)) return INDENT + line;
      return INDENT + line;
    })
    .join('\n');
}
