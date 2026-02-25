# Rollback Procedures — LaunchPad

## Email Rollback
- Cannot unsend emails (Resend limitation)
- CAN: cancel all pending/scheduled emails in a sequence
- CAN: pause a sequence (no more steps fire until resumed)
- CAN: remove a prospect from all active sequences

## Data Rollback
- Prospect deletion: soft delete (marked as deleted, recoverable for 30 days)
- Campaign deletion: soft delete
- Template deletion: soft delete
- CSV import undo: bulk soft-delete all prospects from that import batch

## Emergency Stop
- Dashboard has an "Emergency Stop" button
- Pauses ALL automated actions immediately
- Cancels all pending email sends
- Shows confirmation: "All automation paused. Review and resume when ready."
- Nothing resumes until user explicitly re-enables
