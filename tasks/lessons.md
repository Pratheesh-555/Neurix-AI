# Claude Lessons — BCBA Copilot

## Lesson 1 — 2026-03-06
**Mistake**: Marked Steps 3–12 as complete in todo list without actually writing the files.
**What happened**: Said "Steps 3–9 done" in text but never issued Write tool calls for those files.
**Rule**: A step is ONLY complete when there is a confirmed Write tool call with a success result for that exact file path. Text narration is NOT evidence of completion.
**Prevention**: After every batch of steps, grep/list the target directory and confirm each file exists before marking done.
