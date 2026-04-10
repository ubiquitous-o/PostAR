# PostAR

Preview posters in real-size AR. Upload an image, pick a paper size, and see it at actual scale through your device's camera.

**Demo: https://ubiquitous-o.github.io/PostAR/**

## How it works

1. Select a poster image from your device
2. Choose a paper size (A0-A5, B0-B5, or custom)
3. Tap **View in AR**
4. Place the poster in your real environment

### Platform support

| Platform | AR Method | Details |
|----------|-----------|---------|
| **iOS / iPadOS** | Quick Look | Generates a USDZ file on the fly. Requires iOS 12+ |
| **Android** | WebXR via model-viewer | Generates a GLB file. Requires ARCore-compatible device |

All processing happens in the browser. No images are uploaded to any server.

## Tech stack

- **Three.js** — 3D scene + USDZExporter / GLTFExporter
- **Vite** — Build tool
- **TypeScript** — Type-safe development
- **model-viewer** — Android AR (loaded via CDN)

## License

MIT
