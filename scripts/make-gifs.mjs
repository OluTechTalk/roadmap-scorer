// Converts docs/demos/*.webm to GIFs with ffmpeg's two-pass palette, stepping down fps and width
// until each GIF is under the size cap. Usage: node scripts/make-gifs.mjs [maxMB]
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const maxBytes = Number(process.argv[2] ?? 5) * 1024 * 1024;
const demos = path.resolve('docs/demos');

function findFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    // winget installs ffmpeg but a running shell may not have it on PATH yet.
    const pkgs = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
    if (existsSync(pkgs)) {
      for (const dir of readdirSync(pkgs).filter((d) => d.startsWith('Gyan.FFmpeg'))) {
        for (const sub of readdirSync(path.join(pkgs, dir)).filter((s) =>
          s.startsWith('ffmpeg-'),
        )) {
          const exe = path.join(pkgs, dir, sub, 'bin', 'ffmpeg.exe');
          if (existsSync(exe)) return exe;
        }
      }
    }
    throw new Error('ffmpeg not found. Install it, for example: winget install Gyan.FFmpeg');
  }
}

const ffmpeg = findFfmpeg();
const attempts = [
  { fps: 12, width: 800 },
  { fps: 10, width: 720 },
  { fps: 8, width: 720 },
  { fps: 8, width: 640 },
];

for (const file of readdirSync(demos).filter((f) => f.endsWith('.webm'))) {
  const input = path.join(demos, file);
  const output = input.replace(/\.webm$/, '.gif');
  for (const { fps, width } of attempts) {
    const filter =
      `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];` +
      '[a]palettegen=stats_mode=diff[p];' +
      '[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle';
    execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', input, '-vf', filter, output]);
    const size = statSync(output).size;
    console.log(
      `${path.basename(output)}: ${(size / 1048576).toFixed(1)} MB at ${fps} fps, ${width}px`,
    );
    if (size <= maxBytes) break;
  }
}
