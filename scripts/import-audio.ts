/**
 * One-time import of the debate / guide audio from Google Drive into Supabase Storage.
 *
 *   npx tsx scripts/import-audio.ts                 # import everything not yet uploaded
 *   npx tsx scripts/import-audio.ts --force         # re-download, re-encode and re-upload everything
 *   npx tsx scripts/import-audio.ts --only=japan,resume-design [--force]
 *   npx tsx scripts/import-audio.ts --dry-run --only=japan   # download + encode to a temp dir, no upload
 *
 * For each entry in scripts/audio-sources.json:
 *   Drive download (virus-scan confirm page handled) -> verify it's audio (fail on video/HTML)
 *   -> ffmpeg two-pass loudnorm to -16 LUFS, MP3 64 kbps mono 44.1 kHz
 *   -> ~800 waveform peaks (0–1) -> upload {slug}.mp3 + {slug}.peaks.json to the public "audio" bucket
 * then regenerates lib/audio-tracks.ts.
 *
 * Raw Drive downloads are cached in scripts/.audio-cache/{driveId} (gitignored, shared by dry and real
 * runs, reused while the size still matches Drive's; --force re-encodes but keeps using the cache).
 * Encoded .mp3 / .peaks.json files never land in the repo: they're built in the OS temp dir and deleted
 * after upload (a dry run leaves them there to listen to).
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (read from .env.local / .env) and ffmpeg.
 * If ffmpeg isn't on PATH, set FFMPEG_PATH / FFPROBE_PATH.
 */
import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { createWriteStream, existsSync, readdirSync } from "node:fs";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// TODO: saudi-arabia and south-korea share Drive ID 1xm5DnAiArDNP6ah5E2xNPxC5xEYdjJJK in the source
// list (a paste error). Add both to audio-sources.json once the correct links arrive; until then their
// country pages keep the Buzzsprout embed.
const PENDING_SLUGS = ["saudi-arabia", "south-korea"];

const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.join(ROOT, "scripts", "audio-sources.json");
const TRACKS_FILE = path.join(ROOT, "lib", "audio-tracks.ts");
const RAW_CACHE_DIR = path.join(ROOT, "scripts", ".audio-cache");
const WORK_DIR = path.join(os.tmpdir(), "wta-audio-import");
const BUCKET = "audio";
const PEAK_COUNT = 800;
const PEAK_SAMPLE_RATE = 8000;
const LOUDNORM = "I=-16:TP=-1.5:LRA=11";
const ONE_YEAR = "31536000";
const DOWNLOAD_ATTEMPTS = 6;

type Kind = "country" | "resource";
type Source = { kind: Kind; slug: string; title: string; driveId: string; skipIfVideo?: boolean };
type PeaksFile = { version: 1; durationSec: number; audioHash: string; peaks: number[] };
type Track = { title: string; src: string; peaksSrc: string; durationSec: number };
type Row = { kind: Kind; slug: string; status: string; duration: string; size: string; note: string };

class VideoSourceError extends Error {}

// ---------- env + args ----------

for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (existsSync(p)) process.loadEnvFile(p);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim())) : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dryRun && (!supabaseUrl || !serviceKey)) {
  fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local or .env).");
}
const supabase = createClient(supabaseUrl ?? "http://localhost", serviceKey ?? "dry-run", {
  auth: { persistSession: false },
});
const storage = supabase.storage.from(BUCKET);

const FFMPEG = resolveBin("ffmpeg");
const FFPROBE = resolveBin("ffprobe");

// ---------- main ----------

async function main() {
  const sources: Source[] = JSON.parse(await readFile(SOURCES_FILE, "utf8"));
  validateSources(sources);
  if (only) {
    const unknown = [...only].filter((s) => !sources.some((src) => src.slug === s));
    if (unknown.length) fail(`--only: unknown slug(s): ${unknown.join(", ")}`);
  }

  // Encoded outputs must never be written inside the repo (e.g. if TMP points into it).
  if (isInside(ROOT, WORK_DIR)) fail(`Temp dir ${WORK_DIR} is inside the repo; point TMPDIR (TMP/TEMP on Windows) elsewhere.`);

  await checkFfmpeg();
  if (!dryRun) {
    const { error: bucketError } = await supabase.storage.getBucket(BUCKET);
    if (bucketError) {
      fail(`Bucket "${BUCKET}" not reachable (${bucketError.message}). Apply supabase/migrations/20260924120000_audio_bucket.sql first.`);
    }
  }

  const uploaded = dryRun
    ? { country: new Set<string>(), resource: new Set<string>() }
    : { country: await listFolder("countries"), resource: await listFolder("resources") };

  const tracks: Record<Kind, Record<string, Track>> = { country: {}, resource: {} };
  const rows: Row[] = [];
  let failures = 0;

  for (const [i, src] of sources.entries()) {
    const label = `[${i + 1}/${sources.length}] ${src.kind}/${src.slug}`;
    const names = uploaded[src.kind];
    const isUploaded = names.has(`${src.slug}.mp3`) && names.has(`${src.slug}.peaks.json`);
    const selected = !only || only.has(src.slug);
    const row: Row = { kind: src.kind, slug: src.slug, status: "", duration: "", size: "", note: "" };

    try {
      if (selected && (force || !isUploaded)) {
        console.log(`${label} importing…`);
        const result = await importOne(src);
        tracks[src.kind][src.slug] = result.track;
        Object.assign(row, {
          status: dryRun ? "encoded (dry run)" : "uploaded",
          duration: fmtTime(result.track.durationSec),
          size: fmtMB(result.bytes),
          note: `${result.cached ? "cached " : ""}source ${result.sourceNote}, in ${result.inputLufs} LUFS`,
        });
      } else if (isUploaded) {
        console.log(`${label} already uploaded, skipping`);
        const track = await resolveExisting(src);
        tracks[src.kind][src.slug] = track;
        Object.assign(row, { status: "skipped", duration: fmtTime(track.durationSec), note: "already in bucket" });
      } else {
        Object.assign(row, { status: "missing", note: "excluded by --only" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof VideoSourceError && src.skipIfVideo) {
        Object.assign(row, { status: "skipped", note: `VIDEO, not imported: ${message}` });
      } else {
        failures++;
        Object.assign(row, { status: "FAILED", note: message });
      }
      console.error(`${label} ${row.status}: ${message}`);
    }
    rows.push(row);
  }

  if (!dryRun) await writeTracksFile(tracks);

  console.log("\nSummary");
  console.table(rows);
  console.log(`TODO (not imported): ${PENDING_SLUGS.join(", ")}: duplicate Drive ID in the source list, awaiting correct links.`);
  if (dryRun) console.log("Dry run: nothing uploaded, lib/audio-tracks.ts untouched.");
  else console.log(`Wrote ${path.relative(ROOT, TRACKS_FILE)} (${count(tracks.country)} country, ${count(tracks.resource)} resource tracks).`);
  console.log(`Raw Drive cache: ${path.relative(ROOT, RAW_CACHE_DIR)}${path.sep}`);
  if (dryRun) console.log(`Encoded files to listen to: ${WORK_DIR}${path.sep}`);

  if (failures) {
    console.error(`\n${failures} entr${failures === 1 ? "y" : "ies"} FAILED — see the table above.`);
    process.exit(1);
  }
}

async function importOne(src: Source) {
  const { rawPath, contentType, cached } = await fetchRawSource(src.driveId);
  const sourceNote = await assertAudio(rawPath, contentType);

  await mkdir(WORK_DIR, { recursive: true });
  const base = path.join(WORK_DIR, `${src.kind}-${src.slug}`);
  const mp3Path = `${base}.mp3`;
  const peaksPath = `${base}.peaks.json`;

  try {
    const inputLufs = await transcode(rawPath, mp3Path, src.title);
    const mp3 = await readFile(mp3Path);
    const audioHash = createHash("sha256").update(mp3).digest("hex").slice(0, 10);
    const durationSec = await probeDuration(mp3Path);
    const peaks = await computePeaks(mp3Path);

    const peaksFile: PeaksFile = { version: 1, durationSec, audioHash, peaks };
    const peaksJson = JSON.stringify(peaksFile);

    if (dryRun) {
      await writeFile(peaksPath, peaksJson);
    } else {
      const folder = storagePath(src, "");
      await upload(`${folder}.mp3`, mp3, "audio/mpeg");
      await upload(`${folder}.peaks.json`, Buffer.from(peaksJson), "application/json");
    }
    return { track: toTrack(src, peaksFile), bytes: mp3.length, sourceNote, inputLufs, cached };
  } finally {
    if (!dryRun) await rm(mp3Path, { force: true });
  }
}

async function resolveExisting(src: Source): Promise<Track> {
  const { data, error } = await storage.download(`${storagePath(src, "")}.peaks.json`);
  if (error || !data) throw new Error(`could not read existing peaks: ${error?.message ?? "empty"}`);
  const peaksFile = JSON.parse(await data.text()) as PeaksFile;
  if (typeof peaksFile.durationSec !== "number" || !peaksFile.audioHash) {
    throw new Error("existing peaks.json is malformed; re-run with --force --only=" + src.slug);
  }
  return toTrack(src, peaksFile);
}

// ---------- Google Drive ----------

/**
 * Returns scripts/.audio-cache/{driveId}, downloading it unless a cached copy matches Drive's size.
 * Downloads go to {driveId}.part first, so a file without the suffix is always complete; an
 * interrupted .part is resumed on the next run.
 */
async function fetchRawSource(id: string) {
  await mkdir(RAW_CACHE_DIR, { recursive: true });
  const rawPath = path.join(RAW_CACHE_DIR, id);
  const partPath = `${rawPath}.part`;

  const { contentType, total, fileUrl, ...opened } = await openDriveFile(id);
  let res = opened.res;

  const cachedSize = await fileSize(rawPath);
  if (cachedSize !== null) {
    if (total !== null && cachedSize === total) {
      await res.body?.cancel();
      return { rawPath, contentType, cached: true };
    }
    console.log(`  cached copy is ${fmtMB(cachedSize)}, Drive says ${total === null ? "unknown" : fmtMB(total)}; re-downloading`);
    await rm(rawPath, { force: true });
  }

  // Drive connections drop mid-file on slow links; resume with Range requests rather than start over.
  const progress = { bytes: (await fileSize(partPath)) ?? 0 };
  if (progress.bytes && (total === null || progress.bytes >= total)) progress.bytes = 0;
  if (progress.bytes) {
    console.log(`  resuming earlier download at ${fmtMB(progress.bytes)}`);
    await res.body?.cancel();
    res = await resumeFrom(fileUrl, progress);
  }

  for (let attempt = 1; ; attempt++) {
    try {
      await writeBody(res, partPath, progress);
      if (total === null || progress.bytes >= total) break;
      throw new Error(`connection closed at ${fmtMB(progress.bytes)} of ${fmtMB(total)}`);
    } catch (e) {
      if (attempt >= DOWNLOAD_ATTEMPTS) throw new Error(`download failed after ${attempt} attempts: ${errorReason(e)}`);
      console.log(`  resuming from ${fmtMB(progress.bytes)} (${errorReason(e)})`);
      await sleep(2000 * attempt);
      res = await resumeFrom(fileUrl, progress);
    }
  }
  await rename(partPath, rawPath);
  return { rawPath, contentType, cached: false };
}

async function resumeFrom(fileUrl: string, progress: { bytes: number }) {
  const res = await fetchWithRetry(fileUrl, { Range: `bytes=${progress.bytes}-` });
  if (res.status === 200) progress.bytes = 0; // Range ignored: start over
  else if (res.status !== 206) throw new Error(`resume returned HTTP ${res.status}`);
  return res;
}

async function fileSize(p: string): Promise<number | null> {
  try {
    return (await stat(p)).size;
  } catch {
    return null;
  }
}

/** Opens the real file response, getting past Drive's virus-scan interstitial. Body is left unread. */
async function openDriveFile(id: string) {
  let res = await fetchWithRetry(`https://drive.google.com/uc?export=download&confirm=t&id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Drive returned HTTP ${res.status}`);

  // Large files get an HTML "can't scan for viruses" interstitial with a form to the real download.
  if (isHtml(res.headers.get("content-type"))) {
    const html = await res.text();
    const next = confirmUrlFromHtml(html);
    if (!next) throw new Error(`Drive returned an HTML page instead of the file: ${describeDrivePage(html)}`);
    res = await fetchWithRetry(next);
    if (!res.ok) throw new Error(`Drive confirm download returned HTTP ${res.status}`);
    if (isHtml(res.headers.get("content-type"))) {
      throw new Error(`Drive returned HTML after confirming: ${describeDrivePage(await res.text())}`);
    }
  }
  return {
    res,
    contentType: res.headers.get("content-type") ?? "",
    total: Number(res.headers.get("content-length")) || null,
    fileUrl: res.url,
  };
}

/** Streams the body to dest (appending when progress.bytes > 0), failing if it stalls for 60s. */
async function writeBody(res: Response, dest: string, progress: { bytes: number }) {
  if (!res.body) throw new Error("Drive returned an empty body");
  const out = createWriteStream(dest, { flags: progress.bytes ? "a" : "w" });
  const reader = res.body.getReader();
  try {
    for (;;) {
      let timer: NodeJS.Timeout | undefined;
      const stalled = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("stalled for 60s")), 60_000);
      });
      const { done, value } = await Promise.race([reader.read(), stalled]).finally(() => clearTimeout(timer));
      if (done) break;
      if (!out.write(value)) await once(out, "drain");
      progress.bytes += value.length;
    }
  } catch (e) {
    reader.cancel().catch(() => {});
    throw e;
  } finally {
    await new Promise<void>((resolve) => out.end(resolve));
  }
}

/** One retry on network-level failures; surfaces the real cause (undici hides it behind "fetch failed"). */
async function fetchWithRetry(url: string, headers?: Record<string, string>): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    // Time out waiting for headers only; the body of a large file may legitimately take longer.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(new Error("no response within 60s")), 60_000);
    try {
      return await fetch(url, { headers, signal: ctrl.signal });
    } catch (e) {
      if (attempt >= 2) throw new Error(`network error fetching ${new URL(url).host}: ${errorReason(e)}`);
      await sleep(2000);
    } finally {
      clearTimeout(timer);
    }
  }
}

function errorReason(e: unknown) {
  const cause = (e as { cause?: { code?: string; message?: string } }).cause;
  return cause?.code ?? cause?.message ?? (e instanceof Error ? e.message : String(e));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isHtml(contentType: string | null) {
  return !!contentType && contentType.toLowerCase().includes("text/html");
}

function confirmUrlFromHtml(html: string): string | null {
  const form = html.match(/<form[^>]*id="download-form"[^>]*>/i)?.[0];
  const action = form?.match(/action="([^"]+)"/i)?.[1];
  if (action) {
    const url = new URL(decodeEntities(action));
    for (const input of html.match(/<input[^>]*type="hidden"[^>]*>/gi) ?? []) {
      const name = input.match(/name="([^"]*)"/i)?.[1];
      const value = input.match(/value="([^"]*)"/i)?.[1] ?? "";
      if (name) url.searchParams.set(name, decodeEntities(value));
    }
    return url.toString();
  }
  // Older interstitial: a plain link carrying the confirm token.
  const href = html.match(/href="(\/uc\?export=download[^"]*confirm=[^"]+)"/i)?.[1];
  return href ? new URL(decodeEntities(href), "https://drive.google.com").toString() : null;
}

function describeDrivePage(html: string) {
  const title = decodeEntities(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  if (/sign in|accounts\.google\.com/i.test(title + html.slice(0, 2000))) {
    return `"${title}" — the file isn't shared as "Anyone with the link"`;
  }
  if (/quota/i.test(title + html)) return `"${title}" — download quota exceeded, try again later`;
  return `"${title || "untitled page"}"`;
}

function decodeEntities(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// ---------- ffmpeg ----------

async function assertAudio(file: string, contentType: string): Promise<string> {
  const handle = await open(file, "r");
  const head = Buffer.alloc(512);
  await handle.read(head, 0, 512, 0);
  await handle.close();
  if (/^\s*</.test(head.toString("utf8"))) {
    throw new Error(`downloaded file is HTML/XML, not audio (content-type ${contentType || "unknown"})`);
  }
  if (/^video\//i.test(contentType)) throw new VideoSourceError(`Drive serves it as ${contentType}`);

  const { stdout } = await run(FFPROBE, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], true);
  const probe = JSON.parse(stdout.toString("utf8")) as {
    streams?: { codec_type?: string; codec_name?: string; disposition?: { attached_pic?: number } }[];
    format?: { format_name?: string };
  };
  const streams = probe.streams ?? [];
  // Cover art in an MP3/M4A shows up as a video stream flagged attached_pic; that's still audio.
  const video = streams.filter((s) => s.codec_type === "video" && s.disposition?.attached_pic !== 1);
  const audio = streams.filter((s) => s.codec_type === "audio");
  if (video.length) {
    throw new VideoSourceError(`file contains video (${video.map((s) => s.codec_name).join(", ")})`);
  }
  if (!audio.length) throw new Error(`no audio stream found (format ${probe.format?.format_name ?? "unknown"})`);
  return `${probe.format?.format_name ?? "?"}/${audio[0].codec_name ?? "?"}`;
}

async function transcode(input: string, output: string, title: string): Promise<string> {
  // Downmix first so loudness is measured on what we actually ship.
  const pre = "aformat=channel_layouts=mono";

  // Pass 1: measure.
  const { stderr } = await run(FFMPEG, [
    "-hide_banner", "-nostats", "-i", input, "-vn", "-map", "0:a:0",
    "-af", `${pre},loudnorm=${LOUDNORM}:print_format=json`, "-f", "null", "-",
  ]);
  const json = stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1);
  let m: Record<string, string> | null = null;
  try {
    m = JSON.parse(json);
  } catch {
    m = null;
  }
  const measured = m && Number.isFinite(Number(m.input_i)) && Number.isFinite(Number(m.input_tp));
  const loudnorm = measured
    ? `loudnorm=${LOUDNORM}:measured_I=${m!.input_i}:measured_TP=${m!.input_tp}:measured_LRA=${m!.input_lra}` +
      `:measured_thresh=${m!.input_thresh}:offset=${m!.target_offset}:linear=true`
    : `loudnorm=${LOUDNORM}`; // silent/odd input: fall back to single-pass dynamic mode

  // Pass 2: apply + encode.
  await run(FFMPEG, [
    "-y", "-hide_banner", "-loglevel", "error", "-i", input, "-vn", "-map", "0:a:0",
    "-af", `${pre},${loudnorm}`,
    "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "64k",
    "-map_metadata", "-1", "-id3v2_version", "3",
    "-metadata", `title=${title}`, "-metadata", "artist=World Teachers Academy",
    output,
  ]);
  return measured ? m!.input_i : "n/a";
}

async function probeDuration(file: string): Promise<number> {
  const { stdout } = await run(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], true);
  const d = Number(stdout.toString("utf8").trim());
  if (!Number.isFinite(d) || d <= 0) throw new Error("could not read duration of the encoded MP3");
  return Math.round(d * 10) / 10;
}

async function computePeaks(file: string): Promise<number[]> {
  const { stdout } = await run(
    FFMPEG,
    ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "s16le", "-ac", "1", "-ar", String(PEAK_SAMPLE_RATE), "pipe:1"],
    true,
  );
  const samples = Math.floor(stdout.length / 2);
  if (!samples) throw new Error("decoded no samples for peaks");
  const perBucket = samples / PEAK_COUNT;
  const raw: number[] = [];
  for (let b = 0; b < PEAK_COUNT; b++) {
    const start = Math.floor(b * perBucket);
    const end = Math.max(start + 1, Math.floor((b + 1) * perBucket));
    let max = 0;
    for (let i = start; i < end && i < samples; i++) {
      const v = Math.abs(stdout.readInt16LE(i * 2));
      if (v > max) max = v;
    }
    raw.push(max);
  }
  const top = Math.max(...raw) || 1;
  return raw.map((v) => Math.round((v / top) * 1000) / 1000);
}

function run(bin: string, argv: string[], captureStdout = false): Promise<{ stdout: Buffer; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, argv, { windowsHide: true });
    const out: Buffer[] = [];
    let err = "";
    if (captureStdout) child.stdout.on("data", (c: Buffer) => out.push(c));
    else child.stdout.resume();
    child.stderr.on("data", (c: Buffer) => (err += c.toString("utf8")));
    child.on("error", (e: NodeJS.ErrnoException) =>
      reject(e.code === "ENOENT" ? new Error(`${bin} not found — install ffmpeg or set FFMPEG_PATH/FFPROBE_PATH`) : e),
    );
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout: Buffer.concat(out), stderr: err });
      else reject(new Error(`${path.basename(bin)} exited ${code}: ${err.trim().split("\n").slice(-3).join(" | ")}`));
    });
  });
}

async function checkFfmpeg() {
  try {
    await run(FFMPEG, ["-hide_banner", "-version"]);
    await run(FFPROBE, ["-hide_banner", "-version"]);
  } catch (e) {
    fail((e as Error).message);
  }
}

/** Env override, else the winget install location (PATH isn't refreshed in already-open terminals), else PATH. */
function resolveBin(name: "ffmpeg" | "ffprobe") {
  const fromEnv = process.env[`${name.toUpperCase()}_PATH`];
  if (fromEnv) return fromEnv;
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    const pkgs = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
    try {
      for (const pkg of readdirSync(pkgs).filter((d) => d.startsWith("Gyan.FFmpeg"))) {
        for (const build of readdirSync(path.join(pkgs, pkg))) {
          const exe = path.join(pkgs, pkg, build, "bin", `${name}.exe`);
          if (existsSync(exe)) return exe;
        }
      }
    } catch {
      // fall through to PATH
    }
  }
  return name;
}

// ---------- Supabase ----------

async function listFolder(folder: string): Promise<Set<string>> {
  const { data, error } = await storage.list(folder, { limit: 1000 });
  if (error) fail(`Could not list ${BUCKET}/${folder}: ${error.message}`);
  return new Set((data ?? []).map((o) => o.name));
}

async function upload(objectPath: string, body: Buffer, contentType: string) {
  const { error } = await storage.upload(objectPath, body, { contentType, cacheControl: ONE_YEAR, upsert: true });
  if (error) throw new Error(`upload ${objectPath} failed: ${error.message}`);
}

function storagePath(src: Source, ext: string) {
  return `${src.kind === "country" ? "countries" : "resources"}/${src.slug}${ext}`;
}

function toTrack(src: Source, peaks: PeaksFile): Track {
  // The hash busts the 1-year cache whenever a file is re-imported with --force.
  const v = `?v=${peaks.audioHash}`;
  return {
    title: src.title,
    src: storage.getPublicUrl(storagePath(src, ".mp3")).data.publicUrl + v,
    peaksSrc: storage.getPublicUrl(storagePath(src, ".peaks.json")).data.publicUrl + v,
    durationSec: peaks.durationSec,
  };
}

// ---------- output ----------

async function writeTracksFile(tracks: Record<Kind, Record<string, Track>>) {
  const body = `// Generated by scripts/import-audio.ts — do not edit by hand; re-run the script instead.
// Some entries (e.g. self-intro, international-job-ready) have no page yet and are intentionally unrendered.

export type AudioTrack = { title: string; src: string; peaksSrc: string; durationSec: number };
export type AudioTrackKind = "country" | "resource";

export const audioTracks: Record<AudioTrackKind, Record<string, AudioTrack>> = ${JSON.stringify(tracks, null, 2)};
`;
  await writeFile(TRACKS_FILE, body);
}

// ---------- helpers ----------

function validateSources(sources: Source[]) {
  const seen = new Map<string, string>();
  for (const s of sources) {
    if (s.kind !== "country" && s.kind !== "resource") fail(`${s.slug}: bad kind "${s.kind}"`);
    if (!/^[a-z0-9-]+$/.test(s.slug)) fail(`bad slug "${s.slug}"`);
    if (!s.driveId || !s.title) fail(`${s.slug}: driveId and title are required`);
    const key = `${s.kind}/${s.slug}`;
    if (seen.has(key)) fail(`duplicate entry ${key}`);
    const dupe = [...seen.entries()].find(([, id]) => id === s.driveId);
    if (dupe) fail(`${key} and ${dupe[0]} share Drive ID ${s.driveId} — likely a paste error`);
    seen.set(key, s.driveId);
  }
}

/** True when child is parent itself or anywhere below it. */
function isInside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return !(rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel));
}

function fmtTime(sec: number) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(mm).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

function fmtMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function count(o: object) {
  return Object.keys(o).length;
}

function fail(message: string): never {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

main().catch((e) => fail(e instanceof Error ? e.stack ?? e.message : String(e)));
