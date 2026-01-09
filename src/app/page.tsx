import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to sentiment page immediately
  redirect('/sentiment');
}

