'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect, useState } from 'react';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return <Provider store={store}>{children}</Provider>;
}


