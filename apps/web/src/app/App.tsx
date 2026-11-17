import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { PageLoader } from '@/components/PageLoader';
import { refreshAccessToken } from '@/lib/api-client';
import { Providers } from '@/app/providers';
import { router } from '@/app/router';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshAccessToken()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  return <Providers>{ready ? <RouterProvider router={router} /> : <PageLoader />}</Providers>;
}
