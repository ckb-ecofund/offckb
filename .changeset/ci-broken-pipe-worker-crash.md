---
'@offckb/cli': patch
---

Fix two CI failures on the macOS/Windows test matrix:

- The broken-pipe regression test no longer crashes the jest worker ("jest worker process crashed for an unknown reason: exitCode=0"). It captures the EPIPE handlers installed by `installBrokenPipeHandlers` through a spy on `stream.on` instead of binding them to the live process stdout/stderr streams, so a real stream error can no longer reach a handler with the real (unmocked) `process.exit` and terminate the worker. The covered policy is unchanged: EPIPE exits 0 during normal operation, is swallowed during a graceful shutdown, and non-EPIPE errors are rethrown.
- The Windows daemon-identity probe no longer times out during the `verifyDaemonIdentity` test. The PowerShell + CIM query needs a cold start of a second or two, which routinely exceeded the old 5s probe bound on a loaded runner, making the identity check fail closed against a live process it should have accepted. The probe timeout is now 15s — generous enough for a slow machine, still bounded so a genuinely hung probe fails closed.
