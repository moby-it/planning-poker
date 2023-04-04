// @refresh reload
import { Routes } from "@solidjs/router";
import { Suspense } from "solid-js";
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Meta,
  Scripts,
  Title
} from "solid-start";
import { Link } from "@solidjs/meta";
import { ErrorBoundary } from "solid-start/error-boundary";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With Vitest</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="stylesheet" href="/css/reset.css"></Link>
        <Link rel="stylesheet" href="/css/normalize.css"></Link>
        <Link rel="stylesheet" href="/css/colors.css"></Link>
        <Link rel="stylesheet" href="/css/typography.css"></Link>
        <Link rel="stylesheet" href="/css/layout.css"></Link>
        <Link rel="stylesheet" href="css/input.css"></Link>
      </Head>
      <Body id="root">
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
