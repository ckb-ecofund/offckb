---
'@offckb/cli': patch
---

Fix the broken-pipe regression test crashing the jest worker on macOS and Windows CI ("jest worker process crashed for an unknown reason: exitCode=0"). The test captures the EPIPE handlers installed by `installBrokenPipeHandlers` through a spy on `stream.on` instead of binding them to the live process stdout/stderr streams, so a real stream error can no longer reach a handler with the real (unmocked) `process.exit` and terminate the worker. The covered policy is unchanged: EPIPE exits 0 during normal operation, is swallowed during a graceful shutdown, and non-EPIPE errors are rethrown.
