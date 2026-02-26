import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaunchPad - Personal Launch Command Center',
  description: 'A personal launch command center for solo founders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
