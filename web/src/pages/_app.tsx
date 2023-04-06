import { RoomContext, RoomDispatchContext, roomInitialState, roomReducer } from '@/common/room.context';
import { RootContext, RootDispatchContext, rootInitialState, rootReducer } from '@/common/root.context';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useReducer } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(rootReducer, rootInitialState);
  const [roomState, roomDispatch] = useReducer(roomReducer, roomInitialState);
  return <main id="root">
    <RootContext.Provider value={state}>
      <RootDispatchContext.Provider value={dispatch}>
        <RoomContext.Provider value={roomState}>
          <RoomDispatchContext.Provider value={roomDispatch}>
            <Component {...pageProps} />
          </RoomDispatchContext.Provider>
        </RoomContext.Provider>
      </RootDispatchContext.Provider>
    </RootContext.Provider>
  </main >;
}
