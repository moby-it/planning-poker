import { RoomProvider } from '@/common/room.context';
import { RootProvider } from '@/common/root.context';
import { Header } from '@/components/header/header';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />    </Head>
    <main id="root">
      <RootProvider>
        <RoomProvider>
          <Header />
          <Component {...pageProps} />
        </RoomProvider>
      </RootProvider>
    </main >;
  </>;
}
