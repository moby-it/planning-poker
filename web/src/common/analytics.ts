export function isProduction() {
  return import.meta.env.PROD;
}
export function gtagIsAvailable(): boolean {
  return 'gtag' in window && typeof window.gtag === "function";
}
export function log(eventName: string) {
  if (gtagIsAvailable() && isProduction())
    // @ts-expect-error gtag is available
    window.gtag('event', eventName);
}