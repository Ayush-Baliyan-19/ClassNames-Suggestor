const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  console.log("CSS Suggestor is now active!");

  let classDefinitions = new Map(); // Store class names with their CSS properties
  let currentPackage = "@groww-tech/mint-css"; // Default package

  function findNodeModules() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;
    return path.join(workspaceFolders[0].uri.fsPath, "node_modules");
  }

  async function readPackageCSS(packageName) {
    const nodeModulesPath = findNodeModules();
    if (!nodeModulesPath) {
      vscode.window.showErrorMessage("No workspace folder found");
      return new Map();
    }

    try {
      const packagePath = path.join(nodeModulesPath, packageName);

      if (!fs.existsSync(packagePath)) {
        vscode.window.showErrorMessage(
          `Package ${packageName} not found in node_modules`
        );
        return new Map();
      }

      const possiblePaths = [
        path.join(packagePath, "index.css"),
        path.join(packagePath, "dist", "index.css"),
        path.join(packagePath, "css", "index.css"),
        path.join(packagePath, "styles", "index.css"),
      ];

      let cssContent = "";
      let foundPath = "";

      for (const cssPath of possiblePaths) {
        if (fs.existsSync(cssPath)) {
          cssContent = fs.readFileSync(cssPath, "utf-8");
          foundPath = cssPath;
          break;
        }
      }

      if (!cssContent) {
        vscode.window.showErrorMessage(`No CSS file found in ${packageName}`);
        return new Map();
      }

      console.log(`Reading CSS from: ${foundPath}`);
      const extractedClasses = extractClassDefinitions(cssContent);
      console.log(`Found ${extractedClasses.size} classes`);

      return extractedClasses;
    } catch (error) {
      console.error("Error reading package CSS:", error);
      vscode.window.showErrorMessage(
        `Error reading package ${packageName}: ${error.message}`
      );
      return new Map();
    }
  }

  // Enhanced function to extract class names and their properties
  function extractClassDefinitions(cssContent) {
    const definitions = new Map();
    const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
    let match;
  
    while ((match = classRegex.exec(cssContent)) !== null) {
      const className = match[1];
      let properties = match[2].trim();
  
      if (className && properties) {
        // Add line breaks after each semicolon
        properties = properties.replace(/;/g, ';\n');
        definitions.set(className, properties);
      }
    }
  
    return definitions;
  }

  async function loadCSSClasses(packageName) {
    try {
      vscode.window.showInformationMessage(
        `Scanning ${packageName} for CSS classes...`
      );
      classDefinitions = await readPackageCSS(packageName);
      vscode.window.showInformationMessage(
        `Loaded ${classDefinitions.size} classes from ${packageName}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load classes from ${packageName}: ${error.message}`
      );
    }
  }

  // Initialize with default package
  await loadCSSClasses(currentPackage);

  // Register completion provider
  const provider = vscode.languages.registerCompletionItemProvider(
    [
      "html",
      "javascript",
      "typescript",
      "javascriptreact",
      "typescriptreact",
      "typescriptjsx",
    ],
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.slice(0, position.character);

        // Check for className or class attributes
        const isClassName = /class(Name)?=["'{][^"'{]*$/.test(linePrefix);

        if (!isClassName) {
          console.log('ClassName not found');
          return undefined;
        }

        return Array.from(classDefinitions.entries()).map(([className, properties]) => {
          const completionItem = new vscode.CompletionItem(
            className,
            vscode.CompletionItemKind.Value
          );

          // Create detailed documentation with CSS properties
          const documentation = new vscode.MarkdownString();
          documentation.appendCodeblock(properties, 'css');

          completionItem.documentation = documentation;
          completionItem.detail = `${className} - Mint CSS class`;

          // Determine if we're in a JSX/TSX file
          const isJSX = document.languageId.includes("react");
          const isInQuotes =
            linePrefix.endsWith('"') ||
            linePrefix.endsWith("'") ||
            linePrefix.endsWith("{");

          if (isJSX && !isInQuotes) {
            completionItem.insertText = className;
          } else {
            completionItem.insertText = className;
          }

          return completionItem;
        });
      },
    },
    '"', // Trigger completion when typing inside quotes
    "'", // Also trigger for single quotes
    "{"  // And for JSX expressions
  );

  context.subscriptions.push(provider);

  // Register command to set package
  const setPackageCommand = vscode.commands.registerCommand('css-suggestor.setPackage', async () => {
    const packageName = await vscode.window.showInputBox({
      prompt: 'Enter the NPM package name to load CSS classes from',
      value: currentPackage
    });

    if (packageName) {
      currentPackage = packageName;
      await loadCSSClasses(currentPackage);
    }
  });

  context.subscriptions.push(setPackageCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};