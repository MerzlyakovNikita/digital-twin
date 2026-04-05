export const units: Record<string, string> = {
  c: 'Н·с²/м²',
  v: 'м/с',
  m: 'кг',
  T: 'Н',
  alpha: 'рад',
  c_r: '',
  g: 'м/с²',

  F_d: 'Н',
  F_r: 'Н',
  F_s: 'Н',
  F: 'Н',
  a: 'м/с²',
};

export const getUnit = (id: string) => units[id] ?? '';