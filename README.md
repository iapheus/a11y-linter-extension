
# A11yLinter — Accessibility Linter for VS Code

A lightweight linter that detects accessibility issues in your UI code in real time, provides clear warnings, and suggests improvements.

## Installation

-  Not yet available on the VS Code Marketplace.
-   To install manually:
	 1.  Download the `.vsix`  file from the [Releases](https://github.com/iapheus/a11y-linter-extension/releases/tag/v1.0.0) section of this repository.
	 2.  In VS Code, go to `Extensions → … → Install from VSIX`.

## Usage

1. Open your project — the extension runs automatically on supported file types.  
	  - If it doesn't activate automatically, open the command palette with `Ctrl + Shift + P` and type & run **"Run Accessibility Analysis"** manually.
	  
2. Accessibility issues will be highlighted directly in the editor, and the number of issues will be listed in the status bar below.
3. Hover over any warning to view a detailed description and suggested fix.

## Future Plans

| Feature / Task                                               | Status         |
|--------------------------------------------------------------|----------------|
| Config file for enabling/disabling specific rules            | In progress    |
| Context-aware autofix suggestions                            | ❌ Not started |
| Multi-language support for error description                 | ❌ Not started |
---

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/iapheus/a11y-linter-extension/refs/heads/main/images/codeWarning.png" width="400" height="500" alt="Accessibility error warning" style="display:inline-block;"/>
  <img src="https://raw.githubusercontent.com/iapheus/a11y-linter-extension/refs/heads/main/images/description.png" width="400" height="500" alt="Accessibility error description" style="display:inline-block;"/>
  <img src="https://raw.githubusercontent.com/iapheus/a11y-linter-extension/refs/heads/main/images/aLotOfIssue.png" alt="Number of issues" style="display:inline-block;"/>
  <img src="https://raw.githubusercontent.com/iapheus/a11y-linter-extension/refs/heads/main/images/noIssue.png" alt="No issue" style="display:inline-block;"/>
</p>





