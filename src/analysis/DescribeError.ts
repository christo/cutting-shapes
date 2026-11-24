const URL_ORIGIN = /\w+:\/\/[^/]+\//g;

/**
 * One-line description of an error: message plus the top stack frame, with URL origins stripped for brevity.
 * Handles Chrome stacks (which repeat the message on the first line) and Firefox/Safari stacks (which don't).
 */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const header = `${error.name}: ${error.message}`;
  const frame = error.stack
    ?.split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith(header));
  return (frame ? `${header} ${frame}` : header).replace(URL_ORIGIN, '');
}
