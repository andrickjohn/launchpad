import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login for now - landing page can be added later
  redirect('/login')
}
