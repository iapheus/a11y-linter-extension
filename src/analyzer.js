const vscode = require('vscode');

function analyzeAccessibility(code) {
  
  const config = vscode.workspace.getConfiguration('a11yLinter');
  const shouldWarnOnImg = config.get('warnOnImgIssues');
  const shouldWarnOnAnchor = config.get('warnOnAnchorIssues');
  const shouldWarnOnButton = config.get('warnOnButtonIssues');
  const shouldWarnOnInput = config.get('warnOnInputIssues');
  const shouldWarnOnSelect = config.get('warnOnSelectIssues');
  const shouldWarnOnIframe = config.get('warnOnIframeIssues');
  const shouldWarnOnForm = config.get('warnOnFormIssues');
  const shouldWarnOnTable = config.get('warnOnTableIssues');
  const shouldWarnOnMain = config.get('warnOnMainIssues');

  const issues = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (shouldWarnOnImg && /<img\b/.test(line) && !/\balt\s*=/.test(line)) {
      issues.push({ codeBlock:line, type: 'missing-alt', message: '<img> tag is missing alt text.', line: lineNum });
    }

    if (shouldWarnOnAnchor && /<a\b/.test(line)) {
      if (!/\bhref\s*=/.test(line)) {
        issues.push({ codeBlock:line, type: 'missing-href', message: '<a> tag is missing href.', line: lineNum });
      }
      const hasAria = /\baria-label\s*=/.test(line);
      const hasText = />\s*[^<>\s]+.*<\/a\s*>/.test(line);
      if (!hasAria && !hasText) {
        issues.push({ codeBlock:line, type: 'missing-link-label', message: '<a> tag has no label.', line: lineNum });
      }
      if (/>\s*<\/a\s*>/.test(line)) {
        issues.push({ codeBlock:line, type: 'empty-link-text', message: '<a> tag has empty text.', line: lineNum });
      }
    }

    if (shouldWarnOnButton && /<button\b/.test(line)) {
      const hasAria = /\baria-label\s*=/.test(line);
      const hasText = />\s*[^<>\s]+.*<\/button\s*>/.test(line);
      if (!hasAria && !hasText) {
        issues.push({ codeBlock:line, type: 'missing-button-label', message: '<button> tag missing label.', line: lineNum });
      }
      if (/>\s*<\/button\s*>/.test(line)) {
        issues.push({ codeBlock:line, type: 'empty-button-text', message: '<button> is empty.', line: lineNum });
      }
    }

    if (shouldWarnOnInput && /<input\b/.test(line) && !/\btype\s*=\s*["']hidden["']/.test(line)) {
      const hasLabel = /\baria-label\s*=/.test(line) || /\baria-labelledby\s*=/.test(line) || /\bname\s*=/.test(line);
      if (!hasLabel) {
        issues.push({ codeBlock:line, type: 'missing-input-label', message: '<input> missing label.', line: lineNum });
      }
    }

    if (shouldWarnOnSelect && /<select\b/.test(line) && !/\baria-label\s*=/.test(line) && !/\baria-labelledby\s*=/.test(line)) {
      issues.push({ codeBlock:line, type: 'missing-select-label', message: '<select> missing label.', line: lineNum });
    }

    if (shouldWarnOnIframe && /<iframe\b/.test(line) && !/\btitle\s*=/.test(line)) {
      issues.push({ codeBlock:line, type: 'missing-iframe-title', message: '<iframe> missing title.', line: lineNum });
    }

    if (shouldWarnOnForm && /<form\b/.test(line) && !/\baria-label\s*=/.test(line) && !/\baria-labelledby\s*=/.test(line)) {
      issues.push({ codeBlock:line, type: 'missing-form-label', message: '<form> missing label.', line: lineNum });
    }

    if (shouldWarnOnInput && /<input\b/.test(line) && !/<label\b/.test(code)) {
      issues.push({ codeBlock:line, type: 'unlabeled-input', message: '<input> not associated with any <label>.', line: lineNum });
    }
  });

  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  while (shouldWarnOnTable && (match = tableRegex.exec(code)) !== null) {
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
  if (shouldWarnOnMain && mainMatches && mainMatches.length > 1) {
    issues.push({
      type: 'multiple-main',
      message: 'Multiple <main> elements found — only one should be used per page.'
    });
  }

  return issues;
}

module.exports = analyzeAccessibility;
