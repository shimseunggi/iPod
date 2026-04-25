# iPod Music Mac App

This folder builds a small macOS wrapper around `index.html`.

The wrapper loads the iPod UI in `WKWebView` and exposes:

- `window.webkit.messageHandlers.musicControl`
- `window.webkit.messageHandlers.haptic`

The `musicControl` bridge controls macOS `Music.app` with Apple Events:

- play/pause
- next track
- previous track
- current track state polling
- volume
- player position

Build:

```sh
bash mac/build-mac-app.sh
```

Open:

```sh
open "build/iPod Music.app"
```

On first use, macOS should ask whether `iPod Music` can control `Music.app`.
Allow it for playback controls and now-playing data to work.
