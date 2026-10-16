// Persistent key/value storage for the saved game.
//
// In the Android app the WebView writes localStorage to disk lazily (a few
// seconds after the change), so a game is lost when the app is swiped away
// right after a move. The Capacitor Preferences plugin (Android
// SharedPreferences) is flushed when the app goes to the background, so values
// are written to both and read from Preferences first. In a browser only
// localStorage is used.

const cap: any = typeof window !== "undefined" ? (window as any).Capacitor : undefined;
const native: boolean = !!cap?.isNativePlatform?.();

// The plugin is called through the bridge directly, as the page has no bundler
const preferences = (method: string, options: object): Promise<any> =>
  cap.nativePromise("Preferences", method, options);

export async function storageGet(key: string): Promise<string | null> {
  if (native) {
    try {
      const res = await preferences("get", { key });
      if (typeof res?.value === "string") return res.value;
    } catch (e) {
      // fall back to localStorage
    }
  }
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // storage not available, e.g. private mode
  }
  if (native) preferences("set", { key, value }).catch(() => {});
}

export function storageRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // storage not available
  }
  if (native) preferences("remove", { key }).catch(() => {});
}
