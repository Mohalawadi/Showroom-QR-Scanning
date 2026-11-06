# neulooksOS Scan

Live QR and barcode scanner for the DIGITEX HQ showroom twin.

The showroom twin runs inside Claude, which does not give its page access to the camera. This page runs on its own address with the camera. When it's opened from the twin's **Scan** button, it hands every code back to the twin as soon as it's read.

## What it does

- Reads codes continuously as soon as they are in view: row QR labels (`NL-ROW-36A` or the twin link) and hanger barcodes (Code 128, Code 39, Code 93, EAN, UPC, ITF, Codabar, QR, Data Matrix).
- Reads several hanger tags in one view.
- Zooms in automatically on a QR code that is in view but too small to read, the way WeChat and Alipay do. It also supports pinch-to-zoom, double-tap zoom, the 1× / 2× / 4× buttons, tap-to-focus and the torch.
- Has five modes, which match the twin: Open row, Hang and check, Take out, Return and Find.
- Shows the twin's answer for each scan: checked on the row, planned elsewhere, not in the plan, and so on.

## How it links to the twin

The twin opens `index.html#ch=<channel>&mode=<mode>&row=<row>` with `window.open`. The two pages exchange `postMessage` messages: `{nl:'scan', ...}` from the scanner and `{nl:'twin', ...}` from the twin. The twin only accepts messages from this page's origin, on the channel it opened.

If this page is opened on its own, it still reads codes, but the scans stay on the phone.

## Files

- `index.html`: the scanner (UI, camera, auto-zoom, link to the twin)
- `scan-worker.js`: decodes frames off the main thread
- `zxing-reader.js`, `zxing_reader.wasm`: the [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) 3.1.6 reader build (MIT licence, wrapping zxing-cpp under Apache 2.0)

Where the browser has a built-in `BarcodeDetector` (Chrome on Android), the scanner uses it. On iPhone it uses ZXing.

Live at https://mohalawadi.github.io/Showroom-QR-Scanning/
