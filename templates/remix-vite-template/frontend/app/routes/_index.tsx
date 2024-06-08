import type { MetaFunction } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import Home from '~/components/home.client';

export const meta: MetaFunction = () => {
  return [{ title: 'CKB Remix APP' }, { name: 'description', content: 'Welcome to CKB Remix!' }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <ClientOnly fallback={<p>Loading...</p>}>{() => <Home />}</ClientOnly>
    </div>
  );
}
