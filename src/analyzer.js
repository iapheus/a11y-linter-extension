function analyzeAccessibility(code) {
  const issues = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (/<img\b/.test(line) && !/\balt\s*=/.test(line)) {
      issues.push({ type: 'missing-alt', message: '<img> tag is missing alt text.', line: lineNum });
    }

    if (/<a\b/.test(line)) {
      if (!/\bhref\s*=/.test(line)) {
        issues.push({ type: 'missing-href', message: '<a> tag is missing href.', line: lineNum });
      }
      const hasAria = /\baria-label\s*=/.test(line);
      const hasText = />\s*[^<>\s]+.*<\/a\s*>/.test(line);
      if (!hasAria && !hasText) {
        issues.push({ type: 'missing-link-label', message: '<a> tag has no label.', line: lineNum });
      }
      if (/>\s*<\/a\s*>/.test(line)) {
        issues.push({ type: 'empty-link-text', message: '<a> tag has empty text.', line: lineNum });
      }
    }

    if (/<button\b/.test(line)) {
      const hasAria = /\baria-label\s*=/.test(line);
      const hasText = />\s*[^<>\s]+.*<\/button\s*>/.test(line);
      if (!hasAria && !hasText) {
        issues.push({ type: 'missing-button-label', message: '<button> tag missing label.', line: lineNum });
      }
      if (/>\s*<\/button\s*>/.test(line)) {
        issues.push({ type: 'empty-button-text', message: '<button> is empty.', line: lineNum });
      }
    }

    if (/<input\b/.test(line) && !/\btype\s*=\s*["']hidden["']/.test(line)) {
      const hasLabel = /\baria-label\s*=/.test(line) || /\baria-labelledby\s*=/.test(line) || /\bname\s*=/.test(line);
      if (!hasLabel) {
        issues.push({ type: 'missing-input-label', message: '<input> missing label.', line: lineNum });
      }
    }

    if (/<select\b/.test(line) && !/\baria-label\s*=/.test(line) && !/\baria-labelledby\s*=/.test(line)) {
      issues.push({ type: 'missing-select-label', message: '<select> missing label.', line: lineNum });
    }

    if (/<iframe\b/.test(line) && !/\btitle\s*=/.test(line)) {
      issues.push({ type: 'missing-iframe-title', message: '<iframe> missing title.', line: lineNum });
    }

    if (/<form\b/.test(line) && !/\baria-label\s*=/.test(line) && !/\baria-labelledby\s*=/.test(line)) {
      issues.push({ type: 'missing-form-label', message: '<form> missing label.', line: lineNum });
    }

    if (/<input\b/.test(line) && !/<label\b/.test(code)) {
      issues.push({ type: 'unlabeled-input', message: '<input> not associated with any <label>.', line: lineNum });
    }
  });

  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = tableRegex.exec(code)) !== null) {
    const tableBlock = match[0];
    const startIndex = match.index;
    const lineNum = code.slice(0, startIndex).split('\n').length;

    if (!/<caption\b[^>]*>[\s\S]*?<\/caption>/i.test(tableBlock)) {
      issues.push({
        type: 'missing-table-caption',
        message: '<table> is missing a <caption>',
        line: lineNum
      });
    }
  }

  const mainMatches = code.match(/<main\b/g);
  if (mainMatches && mainMatches.length > 1) {
    issues.push({
      type: 'multiple-main',
      message: 'Multiple <main> elements found — only one should be used per page.'
    });
  }

  return issues;
}

module.exports = analyzeAccessibility;
