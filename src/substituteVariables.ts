import escapeRegExp from 'lodash/escapeRegExp';
import path from 'path';
import { env, window, workspace } from 'vscode';

const enum VariableNames {
	File = '${file}', // the current opened file (absolute path?)
	FileBasename = '${fileBasename}', // the current opened file's basename
	FileBasenameNoExtension = '${fileBasenameNoExtension}', // the current opened file's basename with no file extension
	FileExtname = '${fileExtname}', // the current opened file's extension
	FileDirname = '${fileDirname}', // the current opened file's dirname
	FileWorkspaceFolder = '${fileWorkspaceFolder}', // the current opened file's workspace folder (no idea)
	WorkspaceFolder = '${workspaceFolder}', // the path of the folder opened in VS Code
	WorkspaceFolderBasename = '${workspaceFolderBasename}', // the name of the folder opened in VS Code without any slashes (/)
	ExecPath = '${execPath}', //  location of Code.exe
	PathSeparator = '${pathSeparator}', // `/` on macOS or linux, `\` on Windows
	LineNumber = '${lineNumber}', // the current selected line number in the active file
	SelectedText = '${selectedText}', // the current selected text in the active file
	// ────────────────────────────────────────────────────────────
	// relativeFile = '${relativeFile}', // the current opened file relative to `workspaceFolder`
	// relativeFileDirname = '${relativeFileDirname}', // the current opened file's dirname relative to `workspaceFolder`
	// cwd = '${cwd}', // the task runner's current working directory on startup
}

const variableRegexps = {
	[VariableNames.File]: new RegExp(escapeRegExp(VariableNames.File), 'ig'),
	[VariableNames.FileBasename]: new RegExp(escapeRegExp(VariableNames.FileBasename), 'ig'),
	[VariableNames.FileBasenameNoExtension]: new RegExp(escapeRegExp(VariableNames.FileBasenameNoExtension), 'ig'),
	[VariableNames.FileDirname]: new RegExp(escapeRegExp(VariableNames.FileDirname), 'ig'),
	[VariableNames.FileExtname]: new RegExp(escapeRegExp(VariableNames.FileExtname), 'ig'),
	[VariableNames.FileWorkspaceFolder]: new RegExp(escapeRegExp(VariableNames.FileWorkspaceFolder), 'ig'),
	[VariableNames.WorkspaceFolder]: new RegExp(escapeRegExp(VariableNames.WorkspaceFolder), 'ig'),
	[VariableNames.WorkspaceFolderBasename]: new RegExp(escapeRegExp(VariableNames.WorkspaceFolderBasename), 'ig'),
	[VariableNames.ExecPath]: new RegExp(escapeRegExp(VariableNames.ExecPath), 'ig'),
	[VariableNames.PathSeparator]: new RegExp(escapeRegExp(VariableNames.PathSeparator), 'ig'),
	[VariableNames.LineNumber]: new RegExp(escapeRegExp(VariableNames.LineNumber), 'ig'),
	[VariableNames.SelectedText]: new RegExp(escapeRegExp(VariableNames.SelectedText), 'ig'),
	// [VariableNames.relativeFile]: new RegExp(escapeRegExp(VariableNames.relativeFile), 'ig'),
	// [VariableNames.relativeFileDirname]: new RegExp(escapeRegExp(VariableNames.relativeFileDirname), 'ig'),
	// [VariableNames.cwd]: new RegExp(escapeRegExp(VariableNames.cwd), 'ig'),
};
/**
 * Try to emulate variable substitution in tasks https://code.visualstudio.com/docs/editor/variables-reference
 */
export function substituteVariables(str: string) {
	const activeTextEditor = window.activeTextEditor;
	const workspaceFolder = workspace.workspaceFolders?.[0].uri.fsPath;
	if (str.includes(VariableNames.SelectedText) && activeTextEditor) {
		const selection = activeTextEditor.selection;
		const selectedText = activeTextEditor.document.getText(selection);
		str = str.replace(variableRegexps[VariableNames.SelectedText], selectedText);
	}
	if (str.includes(VariableNames.PathSeparator)) {
		str = str.replace(variableRegexps[VariableNames.PathSeparator], path.sep);
	}
	if (str.includes(VariableNames.LineNumber) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.LineNumber], String(activeTextEditor.selection.active.line + 1));
	}
	if (str.includes(VariableNames.ExecPath)) {
		str = str.replace(variableRegexps[VariableNames.ExecPath], env.appRoot);
	}
	if (str.includes(VariableNames.File) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.File], activeTextEditor.document.uri.fsPath);
	}
	if (str.includes(VariableNames.FileBasename) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.FileBasename], path.basename(activeTextEditor.document.uri.fsPath));
	}
	if (str.includes(VariableNames.FileBasenameNoExtension) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.FileBasenameNoExtension], path.basename(activeTextEditor.document.uri.fsPath, path.extname(activeTextEditor.document.uri.fsPath)));
	}
	if (str.includes(VariableNames.FileExtname) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.FileExtname], path.extname(activeTextEditor.document.uri.fsPath));
	}
	if (str.includes(VariableNames.FileDirname) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.FileDirname], path.dirname(activeTextEditor.document.uri.fsPath));
	}
	if (str.includes(VariableNames.WorkspaceFolder) && workspaceFolder) {
		str = str.replace(variableRegexps[VariableNames.WorkspaceFolder], workspaceFolder);
	}
	if (str.includes(VariableNames.WorkspaceFolderBasename) && workspaceFolder) {
		str = str.replace(variableRegexps[VariableNames.WorkspaceFolderBasename], path.basename(workspaceFolder));
	}
	if (str.includes(VariableNames.FileWorkspaceFolder) && activeTextEditor && workspaceFolder) {
		const fileWorkspaceFolder = workspace.getWorkspaceFolder(activeTextEditor.document.uri)?.uri.fsPath;
		if (fileWorkspaceFolder) {
			str = str.replace(variableRegexps[VariableNames.FileWorkspaceFolder], fileWorkspaceFolder);
		}
	}
	return str;
}
