# StreamPlay

Android audio streaming app. Plays a live HLS radio stream, and has a Kotlin native module that watches the audio output route (speaker, wired, Bluetooth) and pushes changes up to JS as they happen.

Bare React Native 0.79, old architecture, Android only.

## Running it

Node 18+, JDK 17, Android SDK, min API 24.

```bash
npm install
npm start
npm run android
```

No iOS side. The task is an Android native module, so I didn't stub one out just to have it.

If Gradle dies with `Unable to delete directory`, it's a stale daemon: `cd android && ./gradlew.bat --stop && rm -rf app/build`.

## The stream

All India Radio (Prasar Bharati), over BitGravity:

```
https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8
```

No auth, actually live rather than a static file, and audio-only. Live matters for testing, since you can't properly exercise reconnect logic against a file that always loads.

The playlist is single-variant at ~93 kbps with 24 second segments. So there's no adaptive bitrate: if a listener can't sustain that rate, there's nothing lower to drop to and they just stall. Relevant to question 2 below.

## What's done

All three core requirements: HLS playback with play/pause and a buffering state, the native route module pushing updates over an event emitter, and error/reconnecting states with a manual retry.

Skipped, all optional in the brief: seek, automatic reconnection, and the bonus items (MediaSession, Chromecast, Android Auto). `playInBackground` is on so audio survives backgrounding, but with no foreground service or media session behind it I wouldn't call that a real feature.

Playback and the route module were checked on a real device (Realme, Android 15), plugging headphones in and out and confirming the AudioTrack hit `state:started` in `dumpsys audio`.

The network drop path is the one thing I didn't verify on device, since my phone was on Wi-Fi ADB and killing Wi-Fi would have cut the debug connection. To test: play, airplane mode on, expect "Connection lost" plus a retry button within ~12s.

## The native module

`AudioManager.registerAudioDeviceCallback()` fires on device add/remove. Each one resolves the current route and pushes it to JS via `RCTDeviceEventEmitter`. Nothing polls on either side.

Route resolution reads `getDevices(GET_DEVICES_OUTPUTS)` and picks by priority: Bluetooth, wired, then speaker.

The wired check covers `TYPE_WIRED_HEADSET` and `TYPE_WIRED_HEADPHONES`, but also `TYPE_USB_HEADSET` and `TYPE_USB_DEVICE`. I only caught that because my test phone has no headphone jack. USB-C headphones report as `TYPE_USB_HEADSET`, so checking only the two obvious constants reports "speaker" while someone has headphones in.

It dedupes (skips the emit if the route hasn't changed) and force-emits once on `startListening()` so JS gets an initial value. It implements `LifecycleEventListener` and unregisters on destroy, since the callback holds a reference back to the module and would otherwise leak the ReactContext on every reload.

It's a plain `ReactContextBaseJavaModule` rather than a TurboModule because the brief asked for the bridge specifically. That's deprecated from 0.80, so a real product would want a migration planned.

## Player state

Three separate booleans instead of one status enum: `paused` (what the user asked for), `buffering` (only ever set by `onBuffer`/`onLoad`), `error`.

I started with a single status string and it broke. Pressing play set it to `'buffering'` in the handler, which seems fine, but ExoPlayer prepares the source at mount even with `paused={true}`. By the time you press play it's already buffered and won't emit another `onBuffer`, so nothing was left to clear the flag. The spinner sat there forever while audio played fine underneath.

The rule I landed on: a press handler can say what the user wants, but only the player gets to say what the player is doing.

For network handling, `onError` covers hard failures. A connection that degrades slowly doesn't raise an error at all, it just stops delivering, so there's a watchdog: unpaused and stuck buffering for 12 seconds straight means give up and show the retry. The timer resets on every state change so normal buffering doesn't trip it. Retry bumps a `key` on `<Video>` to force a fresh connection.

12 seconds is a guess. On a real product that should come from rebuffer telemetry.

## Written section

### 1. Expo or bare React Native, given requirement 2?

Bare, but not for the usual reason. "You can't write native modules in Expo" hasn't been true for a long time. Between the Expo Modules API, `expo prebuild` and a custom dev client you could write this exact Kotlin module and use it fine. What you can't do is run it in Expo Go, and Expo Go isn't the only way to run an Expo project. So requirement 2 alone doesn't rule Expo out.

What actually decided it: the app is Android-only and nearly all the work is in Android audio APIs, so Expo's real wins (cross-platform parity, managed builds, OTA) don't pay off. I also needed to edit the Android project directly, flipping `newArchEnabled`, registering the package in `MainApplication.kt`, dropping in adaptive icon resources. In bare RN those are just files. Under prebuild they're generated, so making changes stick means a config plugin, which is a lot of indirection for a five hour task.

If this became a real product with an iOS version, EAS builds and OTA updates, I'd flip to Expo and make this a local Expo module. It's a question about the product around it, not about whether native code is possible.

### 2. Some users on slow networks rebuffer constantly, others don't. Diagnose it, and explain it to a non-technical stakeholder.

Diagnosing it. First get numbers, because "slow network" is the reported symptom, not a cause. Instrument the client per session: rebuffer count and duration, measured throughput against the stream bitrate, segment download times, connection type, device, location, time of day. Then look for what the affected users share.

Then down the chain. The stream ladder first, because it's the most common cause and cheapest to check: if the playlist offers only one quality there's no adaptive bitrate, and anyone below that bitrate has nowhere to drop to. They stall repeatedly while everyone above the line notices nothing, which produces exactly this "some users but not others" split. Ours is single-variant, so that's where I'd start. Then segment length, since 24 second segments mean a big download before playback starts and slow recovery after a stall. Then buffer config (ExoPlayer's `LoadControl` thresholds), then which CDN edge users are hitting, visible in response headers and usually clustered by geography. Finally reproduce it deliberately under a throttled connection before shipping a fix based on a theory.

What I'm really working out is whether it's a client, packaging or delivery problem. Single-variant points hard at packaging.

Explaining it. The audio arrives in chunks, a bit like someone couriering you pages of a book while you're reading it. If pages arrive faster than you read you never notice. Slower, and you finish a page and sit waiting. That waiting is the buffering.

We currently publish the audio in one quality only, so there's no lighter version for someone on a weak connection to fall back on. They either keep up or they wait, which is why it looks so inconsistent between users. The fix is to publish the stream at two or three quality levels and let each app pick automatically, and send it in smaller chunks. People on slow connections would get slightly lower quality instead of silence, which is a much better trade.

## Things I'd tidy up

- `react-native-track-player` is in `package.json` but unused, the app runs on `react-native-video`.
- `src/radio.png` is the original artwork, superseded by `src/assets/radio.png` (background stripped, cropped).
- No tests. Route priority logic and the player state transitions are what I'd cover first, both pure logic.
