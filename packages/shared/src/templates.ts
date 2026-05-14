import type { Template } from './types';

export const TEMPLATES: Template[] = [
  {
    id: 'veverka',
    name: 'Veverka',
    emoji: '🐿️',
    values: [1, 2, 3, 5, 8, 13, 21, '?'],
  },
  {
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    values: [0.5, 1, 2, 3, 5, 8, 13, '?'],
  },
];

export const DEFAULT_TEMPLATE_ID = 'veverka';