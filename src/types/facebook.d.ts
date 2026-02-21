/* eslint-disable @typescript-eslint/no-explicit-any */

interface FacebookPixelEvent {
  (..._args: any[]): void;
  callMethod?: (..._args: any[]) => void;
  queue?: any[];
  loaded?: boolean;
  version?: string;
  push?: (..._args: any[]) => void;
}

interface Window {
  fbq: FacebookPixelEvent;
  _fbq: FacebookPixelEvent;
}
