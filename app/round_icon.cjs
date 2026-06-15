const Jimp = require("jimp");

async function run() {
  const original = await Jimp.read("/tmp/app_icon.png");
  const W = original.bitmap.width;
  const H = original.bitmap.height;
  
  // Standard macOS icon corner radius is about 22.5% of the side length.
  // 1024 * 0.225 = 230.4.
  const R = Math.floor(W * 0.225);

  original.scan(0, 0, W, H, function (x, y, idx) {
    let cx = -1, cy = -1;
    
    if (x < R && y < R) { cx = R; cy = R; }
    else if (x >= W - R && y < R) { cx = W - R - 1; cy = R; }
    else if (x < R && y >= H - R) { cx = R; cy = H - R - 1; }
    else if (x >= W - R && y >= H - R) { cx = W - R - 1; cy = H - R - 1; }

    if (cx !== -1 && cy !== -1) {
      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance >= R) {
        this.bitmap.data[idx + 3] = 0; // Alpha
      } else if (distance > R - 1) {
        // Anti-aliasing
        const ratio = R - distance;
        this.bitmap.data[idx + 3] = Math.floor(255 * ratio);
      }
    }
  });

  // Now create a padded canvas
  const size = Math.floor(W * 1.25); // 25% padding
  const padded = new Jimp(size, size, 0x00000000); // transparent background
  const offset = Math.floor((size - W) / 2);
  
  // Add a subtle drop shadow
  // We'll skip complex blur for shadow to keep it simple, but let's just place the image.
  // Standard Mac icons have a bit of shadow. 
  // Let's just do a simple squircle with padding.
  
  padded.composite(original, offset, offset);
  await padded.writeAsync("/tmp/app_icon_final.png");
  console.log("Rounded and padded icon saved.");
}

run().catch(console.error);
