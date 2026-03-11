export function extractJSON(text) {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // Strategy 2: Brace extraction
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
  } catch (_) {}

  // Strategy 3: Newline repair
  try {
    const cleaned = text
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(cleaned.substring(start, end + 1));
    }
  } catch (_) {}

  // Strategy 4: Combined repair
  try {
    let cleaned = text;
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/'/g, '"')
      .replace(/(\w+)\s*:/g, '"$1":')
      .replace(/""+/g, '"');
    return JSON.parse(cleaned);
  } catch (_) {}

  throw new Error("Failed to extract JSON from response after 4 strategies");
}
