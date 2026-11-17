/** Barre de progression de lecture : animée par le défilement lui-même (CSS `animation-timeline: scroll()`), sans JavaScript. */
export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="ivo-scroll-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-gradient-to-r from-primary via-sky-400 to-primary"
    />
  );
}
