import type { Expr } from '../types/ast';
import type { Node } from '../types/model';

export const trainNodes: Node[] = [
  { id: 'T', type: 'input', label: 'Тяга (T)' },
  { id: 'c', type: 'input', label: 'Коэф. аэродинамического сопротивления (c)' },
  { id: 'v', type: 'input', label: 'Скорость (v)' },
  { id: 'c_r', type: 'input', label: 'Коэф. сопротивления качению (cᵣ)' },
  { id: 'g', type: 'input', label: 'Ускорение свободного падения (g)' },
  { id: 'm', type: 'input', label: 'Масса (m)' },
  { id: 'alpha', type: 'input', label: 'Уклон (α)' },

  {
    id: 'F_d',
    type: 'compute',
    label: 'Аэродинамическое сопротивление',
    lhs: 'F_d',
    display: 'Fₐ',
    expr: {
      type: 'mul',
      left: { type: 'var', name: 'c' },
      right: {
        type: 'pow',
        base: { type: 'var', name: 'v' },
        exp: { type: 'num', value: 2 },
      },
    } as Expr,
  },

  {
    id: 'F_r',
    type: 'compute',
    label: 'Сопротивление качению',
    lhs: 'F_r',
    display: 'Fᵣ',
    expr: {
      type: 'mul',
      left: { type: 'var', name: 'c_r' },
      right: {
        type: 'mul',
        left: { type: 'var', name: 'm' },
        right: { type: 'var', name: 'g' },
      },
    },
  },

  {
    id: 'F_s',
    type: 'compute',
    label: 'Сопротивление уклона',
    lhs: 'F_s',
    display: 'Fₛ',
    expr: {
      type: 'mul',
      left: { type: 'var', name: 'm' },
      right: {
        type: 'mul',
        left: { type: 'var', name: 'g' },
        right: {
          type: 'func',
          name: 'sin',
          arg: { type: 'var', name: 'alpha' },
        },
      },
    },
  },

  {
    id: 'F',
    type: 'compute',
    label: 'Результирующая сила',
    lhs: 'F',
    display: 'F',
    expr: {
      type: 'sub',
      left: {
        type: 'sub',
        left: {
          type: 'sub',
          left: { type: 'var', name: 'T' },
          right: { type: 'var', name: 'F_d' },
        },
        right: { type: 'var', name: 'F_r' },
      },
      right: { type: 'var', name: 'F_s' },
    },
  },

  {
    id: 'a',
    type: 'compute',
    label: 'Ускорение',
    lhs: 'a',
    display: 'a',
    expr: {
      type: 'div',
      left: { type: 'var', name: 'F' },
      right: { type: 'var', name: 'm' },
    },
  },
];