/**
 * The CLI installs broken-pipe handlers so `offckb ... | head` exits quietly.
 * Regression guard for the piped-Ctrl+C case: while a graceful shutdown is
 * running, an EPIPE from a dead downstream reader (Ctrl+C kills the whole
 * pipeline) must NOT exit the process — that would truncate the async fiber
 * cleanup (runtime.json left behind) and mask the 130/143 exit code.
 */

// Thrown by the mocked process.exit so a test observes "the process would
// have exited here" instead of falling through to the code after exit().
class ProcessExit extends Error {
  constructor(public readonly code?: number) {
    super(`process.exit(${code ?? 'undefined'})`);
  }
}

type ShutdownModule = typeof import('../src/util/shutdown');

function epipe(): NodeJS.ErrnoException {
  const error = new Error('write EPIPE') as NodeJS.ErrnoException;
  error.code = 'EPIPE';
  return error;
}

describe('util/shutdown broken-pipe policy', () => {
  let shutdown: ShutdownModule;
  let exitSpy: jest.SpyInstance<never, [code?: number]>;

  beforeEach(() => {
    jest.resetModules();
    shutdown = require('../src/util/shutdown') as ShutdownModule;
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new ProcessExit(code);
    }) as (code?: number) => never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  /**
   * Run installBrokenPipeHandlers without binding anything to the live
   * process.stdout/stderr streams. Installing error handlers on the real
   * streams inside a shared jest worker is unsafe: a genuine stream error
   * (EPIPE on a closed pipe while running with piped output on macOS/Windows)
   * can fire asynchronously and reach the handler after the mocked
   * process.exit has been restored, causing the worker itself to exit — the
   * "jest worker process crashed for an unknown reason: exitCode=0" CI
   * failure. Capturing the handlers through a spy on `stream.on` tests the
   * exact same policy logic (including that both streams get a handler) with
   * no global side effects.
   */
  function captureHandlers(): Array<(error: NodeJS.ErrnoException) => void> {
    const handlers: Array<(error: NodeJS.ErrnoException) => void> = [];
    const stdoutOn = jest.spyOn(process.stdout, 'on');
    const stderrOn = jest.spyOn(process.stderr, 'on');
    shutdown.installBrokenPipeHandlers();
    for (const streamOn of [stdoutOn, stderrOn]) {
      for (const [event, handler] of streamOn.mock.calls) {
        if (event === 'error') {
          handlers.push(handler as (error: NodeJS.ErrnoException) => void);
        }
      }
      streamOn.mockRestore();
    }
    return handlers;
  }

  it('starts outside a graceful shutdown', () => {
    expect(shutdown.isGracefulShutdownInProgress()).toBe(false);
  });

  it('installs an error handler on both stdout and stderr', () => {
    expect(captureHandlers()).toHaveLength(2);
  });

  it('exits 0 on EPIPE during normal operation (the `| head` case)', () => {
    const [stdoutHandler] = captureHandlers();
    expect(() => stdoutHandler(epipe())).toThrow(ProcessExit);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('handles stderr the same way as stdout', () => {
    const [, stderrHandler] = captureHandlers();
    expect(() => stderrHandler(epipe())).toThrow(ProcessExit);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('swallows EPIPE once a graceful shutdown is in progress', () => {
    const [stdoutHandler, stderrHandler] = captureHandlers();
    shutdown.enterGracefulShutdown();
    expect(shutdown.isGracefulShutdownInProgress()).toBe(true);
    // Repeated writes to the dead pipe keep erroring; none may exit.
    expect(() => stdoutHandler(epipe())).not.toThrow();
    expect(() => stderrHandler(epipe())).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('still rethrows non-EPIPE stream errors during a shutdown', () => {
    const [stdoutHandler] = captureHandlers();
    shutdown.enterGracefulShutdown();
    const error = new Error('some other stream failure');
    expect(() => stdoutHandler(error)).toThrow(error);
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
