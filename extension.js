// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const command = vscode.commands.registerCommand('permission-set-diff-helper.run', () => {
    const activeTextEditor = vscode.window.activeTextEditor;
    const activeDocFileName = activeTextEditor.document.fileName;

    const visibleTextEditors = vscode.window.visibleTextEditors;
    let remoteDocEditor = undefined;
    let localeDocEditor = undefined;
    let sameNameFilesCount = 0;
    visibleTextEditors.forEach(visibleTextEditor => {
      if (visibleTextEditor.document.fileName === activeDocFileName) {
        if (!remoteDocEditor) {
          remoteDocEditor = visibleTextEditor;
        } else {
          localeDocEditor = visibleTextEditor;
        }
        sameNameFilesCount++;
      } 
    });

    if (sameNameFilesCount < 2) {
      return;
    } else if (typeof(remoteDocEditor) === 'undefined' || typeof(localeDocEditor) === 'undefined') {
      return;
    } else {
      // const workspaceEdit = new vscode.WorkspaceEdit();
      const localeDoc = localeDocEditor.document;
      const localeDocContentLines = localeDoc.getText().replaceAll(' ', '').split('\n');

      const typesOpeningTagsToValues = {
        '<applicationVisibilities>': [
          '<application>'
        ],
        '<classAccesses>': [
          '<apexClass>'
        ],
        // '<customMetadataTypeAccesses>',
        '<fieldPermissions>': [
          '<editable>',
          '<field>',
          '<readable>'
        ]
        // '<objectPermissions>',
        // '<pageAccesses>',
        // '<recordTypeVisibilities>',
        // '<tabSettings>'
      };

      const typesValuesNames = [
        '<application>',
        '<apexClass>',
        '<field>'
      ];
        // '<objectPermissions>',
        // '<pageAccesses>',
        // '<recordTypeVisibilities>',
        // '<tabSettings>'
      
      const typesOpeningTagsToValuesKeys = Object.keys(typesOpeningTagsToValues);
      const typesClosingTags = typesOpeningTagsToValuesKeys.map(openingTag => openingTag.replace('<', '</'));
      const typesToNames = {};
      const typesAndNamesToValues = {};
      let currentType = undefined;
      let currentValueName = undefined;

      localeDocContentLines.forEach((contentLine, i) => {
        try {
          contentLine = contentLine.trim();
          if (currentType === undefined && typesOpeningTagsToValuesKeys.includes(contentLine)) {
            currentType = contentLine;
            if (typesToNames[currentType] === undefined) {
              typesToNames[currentType] = [];
            }
          } else if(currentType !== undefined) {
            if (typesClosingTags.includes(contentLine.replace('<', '</'))) {
              currentType = undefined;
              currentValueName = undefined;
            } else {
              const indexOfOpeningTagClosing = contentLine.indexOf('>');
              const indexOfClosingTagOpening = contentLine.indexOf('</');
              const valueName = contentLine.substring(0, indexOfOpeningTagClosing + 1);
              const valueValue = contentLine.substring(indexOfOpeningTagClosing + 1, indexOfClosingTagOpening);

              if (typesOpeningTagsToValues[currentType] !== undefined) {
                if (currentValueName === undefined) {
                  if (typesOpeningTagsToValues[currentType].includes(valueName)) {
                    if (!typesToNames[currentType].includes(valueValue)) {
                      typesToNames[currentType].push(valueValue);
                    }
                    currentValueName = valueName;
                  } else {
                    for(let j = i; j < i + 10; j++) {
                      const auxContentLine = localeDocContentLines[j];
                      const auxIndexOfOpeningTagClosing = auxContentLine.indexOf('>');
                      const auxValueName = auxContentLine.substring(0, auxIndexOfOpeningTagClosing + 1);
                      if(typesOpeningTagsToValues[currentType] !== undefined 
                        && typesOpeningTagsToValues[currentType].includes(auxValueName)
                      ) {
                        currentValueName = auxValueName;
                      }
                    } 
                  }
                }
              }

              const key = `${currentType}-${currentValueName}`;
              if (typesAndNamesToValues[key] === undefined) {
                typesAndNamesToValues[key] = {};
              }
              typesAndNamesToValues[key][valueName] = valueValue;
            }
          }
        } catch(err) {
          console.log(err);
          console.log(`error white contentLine ${ contentLine }`);
        }
      });
      console.log(typesToNames)
      console.log(typesAndNamesToValues)
    }
      // console.log(remoteDocContentLines);
      // const workspaceEdit = new vscode.WorkspaceEdit();
      // // const remoteDoc = remoteDocEditor.document;
      // workspaceEdit.replace(
      //     vscode.Uri.file(remoteDoc.fileName),
      //     new vscode.Range(0,0,1,0),
      //     'Hello tehereeee'
      // );
      // vscode.workspace.applyEdit(workspaceEdit);
      // remoteDocEditor?.edit(editBuilder => {
      //   editBuilder.replace(new vscode.Range(0,0,1,0), 'This is a long text meant to replace something that was shorter.');
      // });
      // console.log(remoteDocEditor.edit(editBuilder => {
      //     editBuilder.replace(new vscode.Range(0,0,1,0), 'Hello tehre');
      // }));
      // remoteDocEditor.edit()
    
    // if (editor) {
    //     let document = editor.document;

    //     // Get the document text
    //     const documentText = document.getText();
    //     console.log('document: ',document);
    //     console.log('documentFileName: ',document.fileName);
    //     console.log('documentText: ',documentText);

    //     // DO SOMETHING WITH `documentText`
    // }
  });

	context.subscriptions.push(command);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
