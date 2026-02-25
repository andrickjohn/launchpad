# Output Standards — LaunchPad

## Design Philosophy
This is a personal tool but should LOOK like a million-dollar SaaS.
Dense with information. Rich use of color and contrast. Everything clickable.

## Visual Standards
- Color palette: defined in Tailwind config (dark sidebar, light content, accent for actions)
- Typography: Inter or system fonts — clean, readable
- Spacing: consistent padding/margins using Tailwind scale
- Cards: subtle shadows, rounded corners, clear hierarchy
- Tables: zebra striping, sortable headers, sticky first column on mobile
- Charts: Recharts library — clean, minimal, informative
- Icons: Lucide React — consistent, lightweight

## Responsive Targets
- Desktop (1920x1080): Full three-column layouts, dense information
- Tablet (768x1024): Two-column where needed, collapsible sidebars
- Mobile (375x812): Single column, bottom navigation, swipe gestures

## Loading States
- Skeleton loaders for data-dependent content (not spinners)
- Optimistic updates for user actions (show result, revert on failure)
- Progress indicators for long operations (AI scoring, imports)

## Empty States
- Every list/table has a helpful empty state with a call to action
- "No prospects yet — import a CSV or add one manually" with buttons

## Error States
- Toast notifications for action failures (top right, auto-dismiss 5s)
- Inline errors for form validation (below the field, red text)
- Full-page error boundaries with "try again" buttons
