export type VoteValue = number | '?';

export interface Player {
  id: string;
  name: string;
  vote: VoteValue | null;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  values: VoteValue[];
}

export interface Room {
  id: string;
  players: Player[];
  revealed: boolean;
  task: string;
  templateId: string;
  funFactIndex: number | null;
}

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