export type Random = () => number;

export function mulberry32(seed: number): Random {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleNormal(random: Random): number {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleGamma(shape: number, random: Random): number {
  if (shape < 1) {
    return sampleGamma(shape + 1, random) * Math.pow(random(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    let x = sampleNormal(random);
    let v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    const u = random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

export function sampleBeta(
  alpha: number,
  beta: number,
  random: Random,
): number {
  const x = sampleGamma(alpha, random);
  const y = sampleGamma(beta, random);
  return x / (x + y);
}
