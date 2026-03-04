---
description: Hello - orient yourself, check project health, and greet the session
---

// turbo-all

# /hello - Start a Session

Orient the session, review messages, and ensure a clean working state.

## Steps

1. Greet the user with an "Aloha" and a welcoming message.

2. Check if `.message_in_a_bottle.txt` exists and read it:
```bash
if [ -f .message_in_a_bottle.txt ]; then cat .message_in_a_bottle.txt; else echo "No message in a bottle found."; fi
```
- If there's a message, read its contents to the user to help explain what to do next.

3. Check the radar for strange behavior or missing/extra files:
```bash
git fetch origin > /dev/null 2>&1 && git status
```
- Look for untracked files, modified files, or branch divergence and mention any strange behavior.

4. Ensure the local development server is running cleanly (batch kill + restart in one command):
```bash
lsof -i :3000 | awk 'NR!=1 {print $2}' | sort -u | xargs kill -9 2>/dev/null; pkill -9 -f "next dev" 2>/dev/null; rm -rf .next; sleep 1; npm run dev &
```
- After running this, confirm that the local server is available at `localhost:3000`.

5. Read LESSONS.md for any relevant past mistakes before proceeding.

6. Let the user know you're ready to launch!
