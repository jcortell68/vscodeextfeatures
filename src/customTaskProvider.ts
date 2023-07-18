import * as vscode from 'vscode';

export class CustomTaskProvider implements vscode.TaskProvider {
	static type = 'mytasktype';

	public async provideTasks(): Promise<vscode.Task[]> {
		return [this.getTask()];
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		return undefined;
	}

	private getTask(): vscode.Task {
		const definition = {
				type: CustomTaskProvider.type
			};
		return new vscode.Task(
			definition,
			vscode.TaskScope.Workspace,
			`my source`,
			CustomTaskProvider.type,
			new vscode.ShellExecution("test.cmd"));
	}
}
