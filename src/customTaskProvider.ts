import * as vscode from 'vscode';

class CustomTaskTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		throw new Error('Method not implemented.');
	}
	close(): void {
		throw new Error('Method not implemented.');
	}
}

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
			new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
				return new CustomTaskTerminal();
			}));
	}
}
