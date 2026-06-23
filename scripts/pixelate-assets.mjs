import fs from 'fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const rules = {
  'flying-cow.png': (r, g, b) => {
    const desat = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && Math.abs(r - b) <= 8;
    return desat && r > 180;
  },
  'sg-party.png': (r, g, b) => {
    const desat = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && Math.abs(r - b) <= 8;
    return desat && r > 210;
  },
  'punt-e-mes.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'blue-hippo.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'japanese-maple.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'stone-lantern.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'koi-pond.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'ey-skyscraper.png': (r, g, b) => {
    const desat = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && Math.abs(r - b) <= 8;
    return desat && r > 240;
  },
  'the-big-now.png': (r, g, b) => {
    return r > 240 && g > 240 && b > 240;
  },
  'armando-testa.png': (r, g, b) => {
    return r > 230 && g > 230 && b > 230;
  },
  'sg-holding.png': (r, g, b) => {
    return r > 240 && g > 240 && b > 240;
  },
  'wunderman-thompson.png': (r, g, b) => {
    return r > 240 && g > 240 && b > 240;
  },
  'dentsu-building.png': (r, g, b) => {
    const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
    return desat && r >= 170 && r <= 210;
  },
  'wunderman-thompson-building.png': (r, g, b) => {
    return r > 240 && g > 240 && b > 240;
  },
  'cherry-tree.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'windmill-body.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'windmill-blades.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'punt-e-mes-building.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  },
  'event-stage.png': (r, g, b) => {
    return r <= 10 && g <= 10 && b <= 10;
  }
};

const targets = {
  'flying-cow.png': { maxW: 64, maxH: 64 },
  'punt-e-mes.png': { maxW: 48, maxH: 63 },
  'blue-hippo.png': { maxW: 72, maxH: 72 },
  'japanese-maple.png': { maxW: 64, maxH: 64 },
  'stone-lantern.png': { maxW: 24, maxH: 36 },
  'koi-pond.png': { maxW: 64, maxH: 64 },
  'ey-skyscraper.png': { maxW: 378, maxH: 298 },
  'the-big-now.png': { maxW: 50, maxH: 22 },
  'armando-testa.png': { maxW: 50, maxH: 22 },
  'sg-holding.png': { maxW: 50, maxH: 22 },
  'wunderman-thompson.png': { maxW: 50, maxH: 22 },
  'dentsu-building.png': { maxW: 338, maxH: 234 },
  'wunderman-thompson-building.png': { maxW: 338, maxH: 258 },
  'cherry-tree.png': { maxW: 64, maxH: 64 },
  'windmill-body.png': { maxW: 120, maxH: 150 },
  'windmill-blades.png': { maxW: 100, maxH: 100 },
  'punt-e-mes-building.png': { maxW: 150, maxH: 200 },
  'event-stage.png': { maxW: 180, maxH: 120 }
};

// Flood-fill BFS to clean background connected to the borders
function cleanBackground(png, isBgRule) {
  const width = png.width;
  const height = png.height;
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Add all border pixels to the queue
  for (let x = 0; x < width; x++) {
    queue.push({ x, y: 0 });
    queue.push({ x, y: height - 1 });
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push({ x: 0, y });
    queue.push({ x: width - 1, y });
  }

  let count = 0;
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const idx = pos << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];

    // Background is either transparent, or matches our specific background rule
    const isBg = a === 0 || isBgRule(r, g, b);

    if (isBg) {
      if (a > 0) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        count++;
      }

      // Add 4-directional neighbors
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      ];
      for (const n of neighbors) {
        if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
          const nPos = n.y * width + n.x;
          if (!visited[nPos]) {
            queue.push(n);
          }
        }
      }
    }
  }
  return count;
}

function resizeNearest(srcPng, dstW, dstH) {
  const dstPng = new PNG({ width: dstW, height: dstH });
  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.floor((dx / dstW) * srcPng.width);
      const sy = Math.floor((dy / dstH) * srcPng.height);
      const srcIdx = (srcPng.width * sy + sx) << 2;
      const dstIdx = (dstW * dy + dx) << 2;
      dstPng.data[dstIdx] = srcPng.data[srcIdx];
      dstPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
      dstPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
      dstPng.data[dstIdx + 3] = srcPng.data[srcIdx + 3];
    }
  }
  return dstPng;
}

function cropFrame(srcPng, frameIndex, frameWidth) {
  const framePng = new PNG({ width: frameWidth, height: srcPng.height });
  const startX = frameIndex * frameWidth;
  for (let y = 0; y < srcPng.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      const srcIdx = (srcPng.width * y + (startX + x)) << 2;
      const dstIdx = (frameWidth * y + x) << 2;
      framePng.data[dstIdx] = srcPng.data[srcIdx];
      framePng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
      framePng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
      framePng.data[dstIdx + 3] = srcPng.data[srcIdx + 3];
    }
  }
  return framePng;
}

function stitchFrames(frames, dstFrameW, dstFrameH) {
  const dstPng = new PNG({ width: dstFrameW * frames.length, height: dstFrameH });
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const startX = i * dstFrameW;
    for (let y = 0; y < dstFrameH; y++) {
      for (let x = 0; x < dstFrameW; x++) {
        const srcIdx = (dstFrameW * y + x) << 2;
        const dstIdx = (dstPng.width * y + (startX + x)) << 2;
        dstPng.data[dstIdx] = frame.data[srcIdx];
        dstPng.data[dstIdx + 1] = frame.data[srcIdx + 1];
        dstPng.data[dstIdx + 2] = frame.data[srcIdx + 2];
        dstPng.data[dstIdx + 3] = frame.data[srcIdx + 3];
      }
    }
  }
  return dstPng;
}

// Add a 1px dark retro outline to the scaled asset to help it fit the pixel-art aesthetic
function addOutline(png) {
  const width = png.width;
  const height = png.height;
  const outlineColor = [23, 42, 31, 255]; // Dark green-black matching map outline style
  const temp = new Uint8Array(png.data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      const idx = pos << 2;
      const a = temp[idx + 3];

      // If the current pixel is transparent, check if it has an opaque neighbor
      if (a === 0) {
        const neighbors = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 }
        ];
        let hasOpaqueNeighbor = false;
        for (const n of neighbors) {
          if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
            const nPos = n.y * width + n.x;
            const nIdx = nPos << 2;
            if (temp[nIdx + 3] > 0) {
              hasOpaqueNeighbor = true;
              break;
            }
          }
        }
        if (hasOpaqueNeighbor) {
          png.data[idx] = outlineColor[0];
          png.data[idx + 1] = outlineColor[1];
          png.data[idx + 2] = outlineColor[2];
          png.data[idx + 3] = outlineColor[3];
        }
      }
    }
  }
}

async function processFile(file) {
  const path = `/Users/vincenzoalbertomarrari/AppAI/Game-LinkedIn/public/assets/logos/${file}`;
  if (!fs.existsSync(path)) {
    console.log(`Skipping: ${file} (does not exist)`);
    return;
  }

  console.log(`Processing: ${file}...`);
  const fileData = fs.readFileSync(path);
  const isBgRule = rules[file];
  if (!isBgRule) {
    console.log(`  No rules defined for ${file}. Skipping.`);
    return;
  }

  // Load via async parser or jpeg-js depending on format
  const isJpeg = fileData[0] === 0xFF && fileData[1] === 0xD8;
  let srcPng;
  if (isJpeg) {
    console.log(`  Detected JPEG format for ${file}. Decoding and converting to PNG...`);
    try {
      const decoded = jpeg.decode(fileData);
      srcPng = new PNG({ width: decoded.width, height: decoded.height });
      srcPng.data = decoded.data;
    } catch (e) {
      console.error(`Failed to decode JPEG ${file}: ${e.message}`);
      return;
    }
  } else {
    // Load via async parser to handle corrupt/trailing bytes gracefully
    srcPng = await new Promise((resolve, reject) => {
      const parser = new PNG();
      parser.parse(fileData, (error, parsedData) => {
        if (parsedData && parsedData.width && parsedData.height) {
          resolve(parsedData);
        } else if (error) {
          reject(error);
        } else {
          reject(new Error('No data parsed'));
        }
      });
    });
  }

  if (file === 'sg-party.png') {
    // Spritesheet: 3 frames side-by-side. Original is 1024x341, so each frame is 341px wide.
    const frameW = 341;
    const dstFrameW = 64;
    const dstFrameH = 48;
    const frames = [];

    for (let i = 0; i < 3; i++) {
      console.log(`  Cropping and processing frame ${i}...`);
      const frame = cropFrame(srcPng, i, frameW);
      cleanBackground(frame, isBgRule);
      const resized = resizeNearest(frame, dstFrameW, dstFrameH);
      addOutline(resized);
      frames.push(resized);
    }

    const finalSpritesheet = stitchFrames(frames, dstFrameW, dstFrameH);
    const buffer = PNG.sync.write(finalSpritesheet);
    fs.writeFileSync(path, buffer);
    console.log(`  Done: Processed 3 frames and stitched into 192x48 spritesheet.`);
  } else {
    // Normal single image
    const cleared = cleanBackground(srcPng, isBgRule);
    console.log(`  Cleared ${cleared} background pixels.`);

    const target = targets[file];
    if (!target) {
      console.log(`  No target size for ${file}. Skipping resize.`);
      return;
    }

    let dstW, dstH;
    if (target.maxW && target.maxH) {
      const scale = Math.min(target.maxW / srcPng.width, target.maxH / srcPng.height);
      dstW = Math.max(1, Math.round(srcPng.width * scale));
      dstH = Math.max(1, Math.round(srcPng.height * scale));
    } else {
      dstW = target.w;
      dstH = target.h;
    }

    console.log(`  Downsampling to ${dstW}x${dstH} (max: ${target.maxW || target.w}x${target.maxH || target.h}) using nearest-neighbor...`);
    let resized = resizeNearest(srcPng, dstW, dstH);

    // Apply outline for actual game assets, but NOT for building facades (like ey-skyscraper, dentsu-building, wunderman-thompson-building) or billboard logos
    if (file !== 'ey-skyscraper.png' && file !== 'dentsu-building.png' && file !== 'wunderman-thompson-building.png' && file !== 'windmill-body.png' && file !== 'punt-e-mes-building.png' && file !== 'event-stage.png' && !['the-big-now.png', 'armando-testa.png', 'sg-holding.png', 'wunderman-thompson.png'].includes(file)) {
      addOutline(resized);
      console.log(`  Added retro pixel outline.`);
    }

    const buffer = PNG.sync.write(resized);
    fs.writeFileSync(path, buffer);
    console.log(`  Done.`);
  }
}

async function run() {
  const allFiles = Object.keys(rules);
  for (const file of allFiles) {
    try {
      await processFile(file);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}

run().catch(console.error);
