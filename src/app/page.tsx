import { redirect } from 'next/navigation';

/**
 * Landing page — immediately redirects to /connect.
 */
export default function RootPage() {
  redirect('/connect');
}