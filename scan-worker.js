// neulooksOS Scan · decoding worker
// Reads QR codes and hanger barcodes from camera frames with ZXing (WebAssembly), off the main thread.
importScripts('zxing-reader.js');

const BASE = self.location.href.replace(/[^/]*$/, '');
const OPTS = {
  formats: ['QRCode', 'MicroQRCode', 'DataMatrix', 'Aztec', 'Code128', 'Code39', 'Code93', 'EAN13', 'EAN8', 'UPCA', 'UPCE', 'ITF', 'Codabar'],
  tryHarder: true,
  tryRotate: true,
  tryInvert: false,
  tryDownscale: true,
  maxNumberOfSymbols: 12,
  returnErrors: true // a QR that is there but too small or blurred comes back with its position: the page zooms towards it
};

let ready = ZXingWASM.prepareZXingModule({
  overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? BASE + 'zxing_reader.wasm' : prefix + path) },
  fireImmediately: true
}).then(
  () => { postMessage({ type: 'ready' }); return true; },
  err => { postMessage({ type: 'fail', message: String((err && err.message) || err) }); return false; }
);

onmessage = async e => {
  const d = e.data;
  if (!d || d.type !== 'frame') return;
  const ok = await ready;
  if (!ok) { postMessage({ type: 'res', id: d.id, res: [], err: 'reader unavailable' }); return; }
  try {
    const img = new ImageData(new Uint8ClampedArray(d.buf), d.w, d.h);
    const res = await ZXingWASM.readBarcodes(img, OPTS);
    postMessage({
      type: 'res', id: d.id,
      res: res.map(r => ({
        text: r.text, format: r.format, valid: !!r.isValid && !r.error, error: r.error || '',
        pts: [r.position.topLeft, r.position.topRight, r.position.bottomRight, r.position.bottomLeft].map(p => ({ x: p.x, y: p.y }))
      }))
    });
  } catch (err) {
    postMessage({ type: 'res', id: d.id, res: [], err: String((err && err.message) || err) });
  }
};
