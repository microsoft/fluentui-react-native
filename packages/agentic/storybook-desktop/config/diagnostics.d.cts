export type DesktopStorybookErrorOutput = Pick<NodeJS.WriteStream, 'write'>;

export function formatDesktopStorybookError(error: unknown): string;
export function writeDesktopStorybookFailure(context: string, error: unknown, output?: DesktopStorybookErrorOutput): void;
