---
description: Goodbye - wrap up, save all work, and leave a clean handoff note
---

# /goodbye - Wrap Up the Session

Log session notes, leave a message in a bottle for the next session, and say goodbye.

## Steps

1. Inform the user you are wrapping up the session.

2. Ask the user: "What was accomplished this session? (Notes)"

3. Save their notes, along with the current date/time, into `.session_history.log` by using your file-editing tools (like write_to_file / append_to_file if you have it) or simply reading and writing the updated history. Do not use bash inner echo to append!

4. Ask the user: "What needs to be done next? (Bottle message)"

5. Save their message into `.message_in_a_bottle.txt` using a file-editing tool.

6. Give the user a brief, friendly "Aloha" type farewell.
