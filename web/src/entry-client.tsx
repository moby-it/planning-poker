import { mount, StartClient } from "solid-start/entry-client";

import { BrowserStorageKeys, RootProvider } from "./common/root.state";
import { RoomProvider } from "./common/room.state";
mount(() =>
  <RootProvider isSpectator={!!Number(localStorage.getItem(BrowserStorageKeys.isSpectator))} username={localStorage.getItem(BrowserStorageKeys.username)} >
    <RoomProvider>
      <StartClient />
    </RoomProvider>
  </RootProvider>
  , document);
