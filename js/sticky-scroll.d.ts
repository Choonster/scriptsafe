declare interface StickyScrollOptions {
  mode?: 'auto' | 'manual';
  container?: string | JQuery<unknown>;
  topBoundary?: number;
  bottomBoundary?: number;
}

declare interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
  stickyScroll(options: StickyScrollOptions | 'reset'): unknown;
}
