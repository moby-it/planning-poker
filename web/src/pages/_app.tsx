import { RootContext, RootDispatchContext, rootInitialState, rootReducer } from '@/common/root.context';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useReducer } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(rootReducer, rootInitialState);
  return <main id="root">
    <RootContext.Provider value={state}>
      <RootDispatchContext.Provider value={dispatch}>
        <Component {...pageProps} />
      </RootDispatchContext.Provider>
    </RootContext.Provider>
  </main>;
}
