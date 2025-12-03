const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

console.log("🎬 Manual Verification Script starting...");

const runTest = async () => {
  const id = 'test-manual-001';
  console.log(`Processing Test Job ${id}...`);

  // Fake job data
  const data = {
    layers: [
      {
        id: '1',
        type: 'text',
        content: 'HELLO ONERA AI',
        start: 0,
        end: 5,
        style: { fontSize: 80, color: '#ff0000', top: '50%', left: '50%' }
      },
      {
        id: '2',
        type: 'text',
        content: 'Rendering from Worker',
        start: 2,
        end: 7,
        style: { fontSize: 40, color: '#ffffff', top: '70%', left: '50%' }
      }
    ],
    canvasSettings: { width: 1920, height: 1080, bgColor: '#111' },
    durationInFrames: 60 // Shortened to 2 seconds for faster test
  };

  const { layers, canvasSettings, durationInFrames } = data;

  try {
    // A. BUNDLE
    const entryPoint = path.join(__dirname, 'src', 'remotion', 'index.jsx');
    console.log(`Bundling: ${entryPoint}`);

    const bundled = await bundle({
      entryPoint,
      onProgress: (p) => console.log(`Bundling progress: ${p}%`),
    });
    console.log(`✅ Bundling successful! Bundle path: ${bundled}`);

    // B. COMPOSITION SELECTION
    console.log("Selecting composition...");
    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'MainSequence',
      inputProps: {
        layers,
        canvasSettings
      },
    });
    console.log(`✅ Composition selected: ${composition.id} (${composition.width}x${composition.height})`);

    // C. RENDER
    const outputLocation = `/tmp/${id}.mp4`;
    console.log(`Rendering ${durationInFrames} frames to ${outputLocation}...`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputLocation,
      inputProps: {
        layers,
        canvasSettings
      },
      durationInFrames: durationInFrames,
      fps: 30,
      onProgress: ({ progress }) => {
        console.log(`Render Progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`✅ Render successful! File saved at ${outputLocation}`);

  } catch (err) {
    console.error(`❌ Test Failed:`, err);
    process.exit(1);
  }
};

runTest();
