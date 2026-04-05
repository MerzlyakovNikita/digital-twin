export const ranges = {
  m: { min: 50000, max: 800000, step: 1000 },
  v: { min: 0, max: 120, step: 0.1 },
  T: { min: 0, max: 600000, step: 1000 },
  alpha: { min: -0.05, max: 0.05, step: 0.001 },
  c: { min: 0.5, max: 10, step: 0.1 },
  c_r: { min: 0.0005, max: 0.005, step: 0.0001 },
  g: { min: 9.78, max: 9.82, step: 0.01 },
};

export const getRange = (id: string) =>
  ranges[id as keyof typeof ranges];