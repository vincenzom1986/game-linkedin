import fs from 'fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

// Specific rules for each asset
const rules = {
  'flying-cow.png': {
    type: 'color-key',
    // The checkerboard colors are white [255,255,255] and light grey [210,210,210]/[211,211,211]
    // We will make all desaturated colors above a certain brightness transparent.
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      return desat && r > 180;
    }
  },
  'sg-party.png': {
    type: 'color-key',
    // The checkerboard is white and desaturated light grey around [233,233,233]
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      return desat && r > 210;
    }
  },
  'punt-e-mes.png': {
    type: 'color-key',
    // Background is solid white [255,255,255]
    isBackground: (r, g, b) => {
      return r > 240 && g > 240 && b > 240;
    }
  },
  'blue-hippo.png': {
    type: 'color-key',
    // Checkerboard is grey [187,187,187] and dark grey [111,111,111]
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      return desat && (r > 100);
    }
  },
  'japanese-maple.png': {
    type: 'color-key',
    // Background is white and light grey [225,225,225]
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      return desat && r > 200;
    }
  },
  'stone-lantern.png': {
    type: 'color-key',
    // Background is solid white/light grey, lantern is dark grey
    isBackground: (r, g, b) => {
      return r > 240 && g > 240 && b > 240;
    }
  },
  'koi-pond.png': {
    type: 'color-key',
    // Background is light grey checkerboard [247,247,247] and grey [192,192,192]
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      const isWhiteCheck = r > 240 && g > 240 && b > 240;
      const isGreyCheck = Math.abs(r - 192) <= 5 && Math.abs(g - 192) <= 5 && Math.abs(b - 192) <= 5;
      return desat && (isWhiteCheck || isGreyCheck);
    }
  },
  'ey-skyscraper.png': {
    type: 'color-key',
    // Background is light grey checkerboard [250,250,250] to [252,252,252]
    isBackground: (r, g, b) => {
      const desat = Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
      return desat && r > 240;
    }
  },
  'the-big-now.png': {
    type: 'color-key',
    // Solid white background
    isBackground: (r, g, b) => {
      return r > 240 && g > 240 && b > 240;
    }
  },
  'armando-testa.png': {
    type: 'color-key',
    // Background is white and light grey [242,243,244]
    isBackground: (r, g, b) => {
      return r > 235 && g > 235 && b > 235;
    }
  },
  'sg-holding.png': {
    type: 'color-key',
    // Solid white/light grey background
    isBackground: (r, g, b) => {
      return r > 240 && g > 240 && b > 240;
    }
  }
};

async function processFile(file, rule) {
  const path = `/Users/vincenzoalbertomarrari/AppAI/Game-LinkedIn/public/assets/logos/${file}`;
  if (!fs.existsSync(path)) {
    console.log(`Skipping: ${file} (does not exist)`);
    return;
  }

  console.log(`Processing: ${file}...`);
  let png;
  
  const fileData = fs.readFileSync(path);
  const isJpeg = fileData[0] === 0xFF && fileData[1] === 0xD8;

  if (isJpeg) {
    console.log(`  Detected JPEG format for ${file}. Decoding and converting to PNG...`);
    try {
      const decoded = jpeg.decode(fileData);
      png = new PNG({ width: decoded.width, height: decoded.height });
      png.data = decoded.data;
    } catch (e) {
      console.error(`Failed to decode JPEG ${file}: ${e.message}`);
      return;
    }
  } else {
    // Try reading via async parser to handle stream/trailing-data errors gracefully
    try {
      png = await new Promise((resolve, reject) => {
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
    } catch (e) {
      console.error(`Failed to parse ${file} as PNG: ${e.message}`);
      return;
    }
  }

  let count = 0;
  // Replace matching background pixels with transparent
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];

      if (a > 0 && rule.isBackground(r, g, b)) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        count++;
      }
    }
  }

  // Write back the processed PNG (always write as PNG now!)
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path, buffer);
  console.log(`  Done: Cleared ${count} background pixels.`);
}

async function run() {
  for (const [file, rule] of Object.entries(rules)) {
    await processFile(file, rule);
  }
}

run().catch(console.error);
