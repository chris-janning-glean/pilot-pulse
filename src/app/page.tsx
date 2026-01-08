import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to sentiment dashboard immediately
  redirect('/dashboard/sentiment');
}

