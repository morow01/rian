const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const Meyda = require("meyda");
const { WaveFile } = require("wavefile");

if (process.argv.length < 5) {
  console.error("Usage: node analyze-speaker-variation.js <ffmpeg> <ffprobe> <audio-file>");
  process.exit(1);
}

const [, , ffmpegPath, ffprobePath, audioPath] = process.argv;

function parseJson(command, args) {
  const text = execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return JSON.parse(text);
}

function getDurationSeconds(file) {
  const data = parseJson(ffprobePath, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "json",
    file,
  ]);
  return Number(data?.format?.duration || 0);
}

function extractSampleToWav(inputFile, startSec, durationSec, outputFile) {
  execFileSync(ffmpegPath, [
    "-y",
    "-ss", String(startSec),
    "-t", String(durationSec),
    "-i", inputFile,
    "-ac", "1",
    "-ar", "16000",
    "-vn",
    "-f", "wav",
    outputFile,
  ], { stdio: ["ignore", "ignore", "pipe"] });
}

function loadWavFloatData(wavPath) {
  const wavBuffer = fs.readFileSync(wavPath);
  const wav = new WaveFile(wavBuffer);
  wav.toBitDepth("32f");
  wav.toSampleRate(16000);
  const samples = wav.getSamples(true, Float32Array);
  return ArrayBuffer.isView(samples) ? Float32Array.from(samples) : Float32Array.from(samples[0] || []);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function kmeans2(points, iterations = 10) {
  if (points.length < 2) {
    return null;
  }

  let centerA = points[0].slice();
  let centerB = points[Math.floor(points.length / 2)].slice();
  let labels = new Array(points.length).fill(0);

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < points.length; i += 1) {
      const da = euclidean(points[i], centerA);
      const db = euclidean(points[i], centerB);
      labels[i] = da <= db ? 0 : 1;
    }

    const groups = [[], []];
    for (let i = 0; i < points.length; i += 1) {
      groups[labels[i]].push(points[i]);
    }
    if (!groups[0].length || !groups[1].length) {
      return null;
    }

    centerA = centerA.map((_, idx) => groups[0].reduce((acc, p) => acc + p[idx], 0) / groups[0].length);
    centerB = centerB.map((_, idx) => groups[1].reduce((acc, p) => acc + p[idx], 0) / groups[1].length);
  }

  const counts = [0, 0];
  const intra = [0, 0];
  for (let i = 0; i < points.length; i += 1) {
    const label = labels[i];
    counts[label] += 1;
    intra[label] += euclidean(points[i], label === 0 ? centerA : centerB);
  }

  return {
    counts,
    separation: euclidean(centerA, centerB),
    compactness: (intra[0] / counts[0]) + (intra[1] / counts[1]),
  };
}

function analyzeFeatures(samples) {
  const bufferSize = 2048;
  const hopSize = 512;
  const featureVectors = [];
  const energies = [];

  for (let offset = 0; offset + bufferSize <= samples.length; offset += hopSize) {
    const frame = samples.slice(offset, offset + bufferSize);
    const features = Meyda.extract(["rms", "zcr", "spectralCentroid", "mfcc"], frame, {
      sampleRate: 16000,
      bufferSize,
      numberOfMFCCCoefficients: 6,
    });
    if (!features) continue;
    energies.push(features.rms);
    featureVectors.push(features);
  }

  if (!featureVectors.length) {
    return null;
  }

  const rmsThreshold = Math.max(0.01, median(energies) * 1.15);
  const voiced = featureVectors
    .filter((f) => {
      const zcrRate = (f.zcr || 0) / bufferSize;
      return f.rms >= rmsThreshold && zcrRate < 0.45;
    })
    .map((f) => [
      f.rms,
      (f.zcr || 0) / bufferSize,
      (f.spectralCentroid || 0) / 4000,
      ...(f.mfcc || []).slice(0, 6).map((n) => n / 100),
    ]);

  if (voiced.length < 20) {
    return { voicedFrames: voiced.length, verdict: "unclear", reason: "too-few-voiced-frames" };
  }

  const result = kmeans2(voiced, 12);
  if (!result) {
    return { voicedFrames: voiced.length, verdict: "single", reason: "single-cluster" };
  }

  const ratio = result.separation / Math.max(result.compactness, 0.0001);
  const minCluster = Math.min(...result.counts);

  let verdict = "single";
  if (ratio > 1.9 && minCluster >= 8) {
    verdict = "multi";
  } else if (ratio > 1.4 && minCluster >= 6) {
    verdict = "maybe-multi";
  }

  return {
    voicedFrames: voiced.length,
    verdict,
    ratio: Number(ratio.toFixed(3)),
    counts: result.counts,
    separation: Number(result.separation.toFixed(3)),
    compactness: Number(result.compactness.toFixed(3)),
  };
}

function pickSampleStarts(duration) {
  if (duration <= 90) return [0];
  if (duration <= 15 * 60) return [30, Math.max(45, duration / 2 - 15)];
  return [
    45,
    Math.max(60, duration * 0.35),
    Math.max(90, duration * 0.7),
  ].map((n) => Math.max(0, Math.floor(n)));
}

const duration = getDurationSeconds(audioPath);
const starts = pickSampleStarts(duration);
const sampleDuration = 30;
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-scan-"));

try {
  const sampleResults = [];
  for (let i = 0; i < starts.length; i += 1) {
    const wavPath = path.join(tempDir, `sample-${i}.wav`);
    extractSampleToWav(audioPath, starts[i], sampleDuration, wavPath);
    const samples = loadWavFloatData(wavPath);
    const analysis = analyzeFeatures(samples) || { verdict: "unclear", reason: "no-analysis" };
    sampleResults.push({ start: starts[i], ...analysis });
  }

  const verdicts = sampleResults.map((s) => s.verdict);
  let overall = "unclear";
  if (verdicts.filter((v) => v === "multi").length >= 2 || verdicts.includes("multi")) {
    overall = "likely-multi-voice";
  } else if (verdicts.every((v) => v === "single")) {
    overall = "likely-single-narrator";
  } else if (verdicts.includes("maybe-multi")) {
    overall = "possibly-multi-voice";
  } else if (verdicts.filter((v) => v === "single").length >= 1) {
    overall = "likely-single-narrator";
  }

  console.log(JSON.stringify({
    audioPath,
    duration: Number(duration.toFixed(1)),
    overall,
    samples: sampleResults,
  }, null, 2));
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore temp cleanup errors
  }
}
