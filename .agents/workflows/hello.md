---
description: Hello - orient yourself, check project health, and greet the session
---

# /hello - Start a Session

Orient the session, review messages, and ensure a clean working state.

## Steps

1. Greet the user with an "Aloha" and a welcoming message.

2. Check if `.message_in_a_bottle.txt` exists and read it:
// turbo-all
```bash
if [ -f .message_in_a_bottle.txt ]; then cat .message_in_a_bottle.txt; else echo "No message in a bottle found."; fi
```
- If there's a message, read its contents to the user to help explain what to do next.

3. Check the radar for strange behavior or missing/extra files:
```bash
git fetch origin > /dev/null 2>&1
git status
```
- Look for untracked files, modified files, or branch divergence and mention any strange behavior.

4. Let the user know you're ready to launch!
