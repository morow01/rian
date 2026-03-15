const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const Meyda = require("meyda");
const { WaveFile } = require("wavefile");

if (process.argv.length < 5) {
  console.error("Usage: node analyze-dialogue-variation.js <ffmpeg> <ffprobe> <audio-file> [<audio-file>...]");
  process.exit(1);
}

const [, , ffmpegPath, ffprobePath, ...audioPaths] = process.argv;

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

function meanPoint(points) {
  const dims = points[0].length;
  const center = new Array(dims).fill(0);
  for (const point of points) {
    for (let i = 0; i < dims; i += 1) {
      center[i] += point[i];
    }
  }
  return center.map((value) => value / points.length);
}

function chooseInitialCenters(points, k) {
  const centers = [points[0].slice()];
  while (centers.length < k) {
    let bestPoint = null;
    let bestDistance = -1;
    for (const point of points) {
      const minDistance = Math.min(...centers.map((center) => euclidean(point, center)));
      if (minDistance > bestDistance) {
        bestDistance = minDistance;
        bestPoint = point;
      }
    }
    centers.push(bestPoint.slice());
  }
  return centers;
}

function kmeans(points, k, iterations = 14) {
  if (points.length < k) return null;
  let centers = chooseInitialCenters(points, k);
  let labels = new Array(points.length).fill(0);

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < points.length; i += 1) {
      let bestIndex = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < centers.length; c += 1) {
        const distance = euclidean(points[i], centers[c]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = c;
        }
      }
      labels[i] = bestIndex;
    }

    const groups = Array.from({ length: k }, () => []);
    for (let i = 0; i < points.length; i += 1) {
      groups[labels[i]].push(points[i]);
    }
    if (groups.some((group) => group.length === 0)) return null;
    centers = groups.map((group) => meanPoint(group));
  }

  return { centers, labels };
}

function silhouette(points, labels, k) {
  if (points.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const ownCluster = labels[i];
    let ownDistances = [];
    let otherClusters = Array.from({ length: k }, () => []);
    for (let j = 0; j < points.length; j += 1) {
      if (i === j) continue;
      const distance = euclidean(points[i], points[j]);
      if (labels[j] === ownCluster) {
        ownDistances.push(distance);
      } else {
        otherClusters[labels[j]].push(distance);
      }
    }
    const a = ownDistances.length ? ownDistances.reduce((s, x) => s + x, 0) / ownDistances.length : 0;
    const otherMeans = otherClusters
      .filter((distances) => distances.length)
      .map((distances) => distances.reduce((s, x) => s + x, 0) / distances.length);
    const b = otherMeans.length ? Math.min(...otherMeans) : 0;
    const denom = Math.max(a, b, 0.0001);
    total += (b - a) / denom;
  }
  return total / points.length;
}

function summarizeTransitions(labels) {
  if (!labels.length) return { switches: 0, switchRate: 0 };
  let switches = 0;
  for (let i = 1; i < labels.length; i += 1) {
    if (labels[i] !== labels[i - 1]) switches += 1;
  }
  return {
    switches,
    switchRate: switches / Math.max(labels.length - 1, 1),
  };
}

function analyzeFrames(samples) {
  const bufferSize = 2048;
  const hopSize = 512;
  const allFrames = [];
  const energies = [];

  for (let offset = 0; offset + bufferSize <= samples.length; offset += hopSize) {
    const frame = samples.slice(offset, offset + bufferSize);
    const features = Meyda.extract(["rms", "zcr", "spectralCentroid", "mfcc"], frame, {
      sampleRate: 16000,
      bufferSize,
      numberOfMFCCCoefficients: 8,
    });
    if (!features) continue;
    energies.push(features.rms);
    allFrames.push(features);
  }

  if (!allFrames.length) return null;

  const rmsThreshold = Math.max(0.01, median(energies) * 1.15);
  const voiced = allFrames
    .filter((f) => {
      const zcrRate = (f.zcr || 0) / bufferSize;
      return f.rms >= rmsThreshold && zcrRate < 0.42;
    })
    .map((f) => [
      f.rms,
      (f.zcr || 0) / bufferSize,
      (f.spectralCentroid || 0) / 4000,
      ...(f.mfcc || []).slice(0, 8).map((n) => n / 100),
    ]);

  if (voiced.length < 28) {
    return {
      voicedFrames: voiced.length,
      verdict: "unclear",
      reason: "too-few-voiced-frames",
      bestK: 1,
      bestSilhouette: 0,
      switchRate: 0,
    };
  }

  let best = {
    k: 1,
    silhouette: 0,
    labels: new Array(voiced.length).fill(0),
  };

  for (const k of [2, 3, 4]) {
    const clustered = kmeans(voiced, k);
    if (!clustered) continue;
    const score = silhouette(voiced, clustered.labels, k);
    if (score > best.silhouette) {
      best = { k, silhouette: score, labels: clustered.labels };
    }
  }

  const transition = summarizeTransitions(best.labels);
  let verdict = "single";
  if (best.k >= 3 && best.silhouette > 0.18) {
    verdict = "multi";
  } else if (best.k === 2 && best.silhouette > 0.16 && transition.switchRate > 0.18) {
    verdict = "multi";
  } else if (best.k >= 2 && best.silhouette > 0.12) {
    verdict = "maybe-multi";
  }

  return {
    voicedFrames: voiced.length,
    verdict,
    bestK: best.k,
    bestSilhouette: Number(best.silhouette.toFixed(3)),
    switchRate: Number(transition.switchRate.toFixed(3)),
    switches: transition.switches,
  };
}

function pickSampleStarts(duration) {
  if (duration <= 90) return [0];
  if (duration <= 15 * 60) {
    return [30, Math.max(45, Math.floor(duration / 2) - 20)];
  }
  return [
    45,
    Math.max(60, Math.floor(duration * 0.33)),
    Math.max(90, Math.floor(duration * 0.66)),
  ];
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dialogue-scan-"));

try {
  const sampleResults = [];
  for (const audioPath of audioPaths) {
    const duration = getDurationSeconds(audioPath);
    const starts = pickSampleStarts(duration);
    for (let i = 0; i < starts.length; i += 1) {
      const wavPath = path.join(tempDir, `${path.basename(audioPath)}-${i}.wav`);
      extractSampleToWav(audioPath, starts[i], 24, wavPath);
      const samples = loadWavFloatData(wavPath);
      const analysis = analyzeFrames(samples) || { verdict: "unclear", reason: "no-analysis" };
      sampleResults.push({
        audioPath,
        start: starts[i],
        ...analysis,
      });
    }
  }

  const verdicts = sampleResults.map((sample) => sample.verdict);
  const multiCount = verdicts.filter((verdict) => verdict === "multi").length;
  const maybeCount = verdicts.filter((verdict) => verdict === "maybe-multi").length;
  const singleCount = verdicts.filter((verdict) => verdict === "single").length;
  const avgK = sampleResults.length
    ? sampleResults.reduce((sum, sample) => sum + (sample.bestK || 1), 0) / sampleResults.length
    : 1;
  const avgSilhouette = sampleResults.length
    ? sampleResults.reduce((sum, sample) => sum + (sample.bestSilhouette || 0), 0) / sampleResults.length
    : 0;
  const avgSwitchRate = sampleResults.length
    ? sampleResults.reduce((sum, sample) => sum + (sample.switchRate || 0), 0) / sampleResults.length
    : 0;

  let overall = "unclear";
  if (multiCount >= 3 || (multiCount >= 2 && avgK >= 2.4)) {
    overall = "likely-multi-voice";
  } else if (multiCount >= 1 || maybeCount >= 3 || (maybeCount >= 2 && avgK >= 2.1)) {
    overall = "possibly-multi-voice";
  } else if (singleCount >= Math.max(2, sampleResults.length - 1)) {
    overall = "likely-single-narrator";
  }

  console.log(JSON.stringify({
    audioPaths,
    overall,
    summary: {
      samples: sampleResults.length,
      multiCount,
      maybeCount,
      singleCount,
      avgK: Number(avgK.toFixed(3)),
      avgSilhouette: Number(avgSilhouette.toFixed(3)),
      avgSwitchRate: Number(avgSwitchRate.toFixed(3)),
    },
    samples: sampleResults,
  }, null, 2));
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (_) {
    // ignore cleanup issues
  }
}
