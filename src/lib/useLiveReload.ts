import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Keeps a screen in step with the database: one Realtime channel listens to
// every change on the given tables and calls `reload` shortly after the
// last one. A POS sale writes 6–12 rows across several tables within a
// second or two, so changes are gathered (trailing debounce) into one
// reload, and a steady stream still reloads at least every `maxWaitMs`.
//
// Realtime is a bonus, not a dependency: while the tab is visible a poll
// runs as well (every `pollMs`, or every `offlinePollMs` while Realtime is
// down), so the screen stays current — and date windows roll over past
// midnight — even if the socket never connects. Coming back to the tab,
// focusing the window or getting the network back reloads at once.

export type LiveStatus = "connecting" | "live" | "offline";

export type LiveReloadOptions = {
  /** Quiet time after the last change before reloading. */
  debounceMs?: number;
  /** Longest a reload waits while changes keep arriving. */
  maxWaitMs?: number;
  /** Poll interval while Realtime is connected. */
  pollMs?: number;
  /** Poll interval while Realtime is down. */
  offlinePollMs?: number;
  /** Pause before opening a fresh channel after the server closed ours. */
  retryMs?: number;
};

export function useLiveReload(
  tables: string[],
  reload: () => void,
  {
    debounceMs = 1200,
    maxWaitMs = 4000,
    pollMs = 60000,
    offlinePollMs = 20000,
    retryMs = 15000,
  }: LiveReloadOptions = {},
): { status: LiveStatus; lastUpdated: Date | null; markUpdated: () => void } {
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Always call the latest reload without re-subscribing on every render.
  const reloadRef = useRef(reload);
  useEffect(() => { reloadRef.current = reload; });

  /** The caller reports a successful load (shown as "updated hh:mm:ss"). */
  const markUpdated = useCallback(() => setLastUpdated(new Date()), []);

  const tableKey = tables.join(",");

  useEffect(() => {
    // Effects never run during SSR, but stay safe if this is ever reused.
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const list = tableKey ? tableKey.split(",") : [];
    let disposed = false;
    let mode: LiveStatus = "connecting";
    let everSubscribed = false;
    let channel: RealtimeChannel | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let onlineTimer: ReturnType<typeof setTimeout> | undefined;
    let firstKickAt: number | null = null;

    const visible = () => document.visibilityState !== "hidden";

    const schedulePoll = () => {
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = undefined;
      if (disposed || !visible()) return;
      pollTimer = setTimeout(() => { pollTimer = undefined; kick(); }, mode === "live" ? pollMs : offlinePollMs);
    };

    const setMode = (next: LiveStatus) => {
      if (disposed) return;
      const changed = next !== mode;
      mode = next;
      setStatus(next);
      if (changed) schedulePoll();
    };

    const fire = () => {
      debounceTimer = undefined;
      firstKickAt = null;
      if (disposed) return;
      // A hidden tab catches up when it is shown again (see onVisibility).
      if (visible()) reloadRef.current();
      schedulePoll();
    };

    // Trailing debounce with a ceiling: wait for `debounceMs` of quiet, but
    // never more than `maxWaitMs` after the first change of a burst.
    function kick() {
      if (disposed) return;
      const now = Date.now();
      if (firstKickAt === null) firstKickAt = now;
      if (debounceTimer) clearTimeout(debounceTimer);
      const wait = Math.max(0, Math.min(debounceMs, firstKickAt + maxWaitMs - now));
      debounceTimer = setTimeout(fire, wait);
    }

    const dropChannel = () => {
      const ch = channel;
      channel = null;
      if (!ch) return;
      try {
        Promise.resolve(supabase.removeChannel(ch)).catch(() => {});
      } catch {
        /* already gone */
      }
    };

    const connect = () => {
      if (disposed) return;
      // The client is created lazily; a stand-in client (tests, previews)
      // may have no Realtime at all — then the poll alone keeps us current.
      const client = supabase as unknown as { channel?: unknown };
      if (typeof client.channel !== "function" || list.length === 0) {
        setMode("offline");
        return;
      }
      try {
        const name = `live:${list.join("+")}:${Math.random().toString(36).slice(2, 10)}`;
        let ch = supabase.channel(name);
        for (const table of list) {
          ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, () => kick());
        }
        channel = ch;
        ch.subscribe((state) => {
          if (disposed || channel !== ch) return;
          if (state === "SUBSCRIBED") {
            // Back after a drop: changes made meanwhile were never sent.
            if (everSubscribed) kick();
            everSubscribed = true;
            setMode("live");
          } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
            // The client keeps retrying this channel by itself.
            setMode("offline");
          } else if (state === "CLOSED") {
            // Closed by the server — this channel will not come back.
            setMode("offline");
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
              retryTimer = undefined;
              if (disposed || channel !== ch) return;
              dropChannel();
              connect();
            }, retryMs);
          }
        });
      } catch {
        dropChannel();
        setMode("offline");
      }
    };

    const onVisibility = () => {
      if (visible()) { kick(); schedulePoll(); }
      else if (pollTimer) { clearTimeout(pollTimer); pollTimer = undefined; }
    };
    const onFocus = () => kick();
    const onOnline = () => {
      kick();
      if (onlineTimer) clearTimeout(onlineTimer);
      onlineTimer = setTimeout(() => {
        onlineTimer = undefined;
        if (disposed) return;
        // A short blip may never drop the socket, so no new SUBSCRIBED
        // arrives: trust the channel's own state. A channel the server
        // closed while we were away is reopened now.
        if (channel?.state === "joined") setMode("live");
        else if (!channel) connect();
      }, 3000);
    };
    const onOffline = () => setMode("offline");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    connect();
    schedulePoll();

    return () => {
      disposed = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pollTimer) clearTimeout(pollTimer);
      if (retryTimer) clearTimeout(retryTimer);
      if (onlineTimer) clearTimeout(onlineTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      dropChannel();
    };
  }, [tableKey, debounceMs, maxWaitMs, pollMs, offlinePollMs, retryMs]);

  return { status, lastUpdated, markUpdated };
}
