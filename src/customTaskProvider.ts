import * as vscode from 'vscode';

class CustomTaskTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		const output = 'somefile.abc:1:4: warning: the roof is on fire ';
		this.doBuild(output);
	}
	close(): void {
		this.writeEmitter.dispose();
		this.closeEmitter.dispose();
	}
	private async doBuild(output: string): Promise<void> {
		return new Promise<void>((resolve) => {
			this.writeEmitter.fire('Starting build...\r\n');
			this.writeEmitter.fire(output + '\r\n');
			this.closeEmitter.fire(0);
			resolve();
		});
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
