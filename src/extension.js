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

      const diagnostic = new vscode.Diagnostic(
        range,
        issue.message,
        vscode.DiagnosticSeverity.Warning
      );

      diagnostic.code = 'a11y-autofix';

      return diagnostic;
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

  const autofixCommand = vscode.commands.registerCommand('a11yLinter.autofix', async (document, range) => {
    const config = vscode.workspace.getConfiguration('a11yLinter');
    const apiKey = config.get('openRouterToken');

    if (!apiKey) {
      vscode.window.showErrorMessage('Autofix requires an API key. Add it from settings.');
      return;
    }

    const codeBlock = document.getText(range);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "user",
              content: `Fix the accessibility issues in this HTML code in a context-aware way. For example, if there is text inside the tag, you can add a short aria-label that matches the text. Or, if there is an href but no text inside the tag, you can insert the appropriate site name from the href into the tag. After making all these additions and updates, return only the updated code—no extra explanation or commentary. Here's the code with accessibility issues: ${codeBlock}`
            }
          ]
        })
      });

      const result = await response.json();
      const fixedCode = result.choices?.[0]?.message?.content;

      if (!fixedCode) {
        vscode.window.showErrorMessage('Could not get correction from AI. Please try again later...');
        return;
      }

      const confirm = await vscode.window.showInformationMessage(
        'This block of code will be modified as suggested by the AI. Do you approve?',
        { modal: true },
        'Yes', 'No'
      );

      if (confirm === 'Yes') {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, range, fixedCode);
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('The issue has been fixed successfully.');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Autofix error: ${error.message}`);
    }
  });

const codeActionProvider = vscode.languages.registerCodeActionsProvider('html', {
  provideCodeActions(document, range, context) {
    const fixableDiagnostics = context.diagnostics.filter(d => d.code === 'a11y-autofix');
    if (fixableDiagnostics.length === 0) return;

    const fixAction = new vscode.CodeAction('Autofix Accessibility Issue', vscode.CodeActionKind.QuickFix);
    fixAction.command = {
      title: 'Run Autofix',
      command: 'a11yLinter.autofix',
      arguments: [document, range]
    };

    return [fixAction];
  }
}, {
  providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
});


  context.subscriptions.push(autofixCommand, codeActionProvider);


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
