import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-Y6Z24JMF0G" async={true} />
        <Script id="analytics">
          {
            `if (window.location.hostname === "poker-planning.net") {
              window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments);
          }
            gtag("js", new Date());
  
            gtag("config", "G-Y6Z24JMF0G");
        }`
          }
        </Script>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="User Friendly, Open-Sourced, Free Forever."
        />
        <link rel="canonical" href="https://poker-planning.net" />
        <link rel="shortcut icon" type="image/ico" href="favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={''} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
