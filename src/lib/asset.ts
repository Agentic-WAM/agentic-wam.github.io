// Prefix a file under public/ with the deploy base path (empty for a root site),
// so <img>/<video> sources keep working when the site is served from a subpath.
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
