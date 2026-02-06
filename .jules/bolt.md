## 2024-05-23 - Tauri sysinfo Re-initialization Bottleneck
**Learning:** Re-initializing `sysinfo::System` with `new_all()` inside a Tauri command is a massive performance killer (~100s of ms + CPU spike). It also often leads to developers adding artificial `sleep()` calls to get accurate CPU diffs.
**Action:** Always instantiate `System` once in `AppState` (wrapped in Mutex) and use `refresh_cpu()` on the shared instance. This removes initialization overhead AND the need for blocking sleeps.
