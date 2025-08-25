const vscode = require('vscode');
const analyzeAccessibility = require('./analyzer');

let statusBarItem;

function activate(context) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility');

  function analyzeDocument(document) {
    if (!document) return;

    const code = document.getText();
    const issues = analyzeAccessibility(code);

    const diagnostics = issues.map(issue => {
      const range = new vscode.Range(
        new vscode.Position(issue.line - 1, 4),
        new vscode.Position(issue.line - 1, 1000)
      );

      return new vscode.Diagnostic(
        range,
        issue.message,
        vscode.DiagnosticSeverity.Warning
      );
    });

    diagnosticCollection.set(document.uri, diagnostics);

    if (!statusBarItem) {
      statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
      statusBarItem.show();
      context.subscriptions.push(statusBarItem);
    }

    statusBarItem.text = diagnostics.length > 0
      ? `⚠️ ${diagnostics.length} accessibility issue(s) found`
      : `✅ No accessibility issues`;
  }

  const command = vscode.commands.registerCommand('a11yLinter.analyze', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      analyzeDocument(editor.document);
    }
  });

  const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
    const activeDoc = vscode.window.activeTextEditor?.document;
    if (activeDoc && event.document.uri.toString() === activeDoc.uri.toString()) {
      analyzeDocument(activeDoc);
    }
  });

  const changeSettingsListener = vscode.workspace.onDidChangeConfiguration(event => {
    if (
      event.affectsConfiguration('a11yLinter.warnOnImgIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnAnchorIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnButtonIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnInputIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnSelectIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnIframeIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnFormIssues') ||
      event.affectsConfiguration('a11yLinter.warnOnTableIssues') || 
      event.affectsConfiguration('a11yLinter.warnOnMainIssues')
    ) {
      const activeDoc = vscode.window.activeTextEditor?.document;
      if (activeDoc) {
        analyzeDocument(activeDoc);
      }
    }
  });

  context.subscriptions.push(command, diagnosticCollection, changeListener, changeSettingsListener);
}

module.exports = { activate };
