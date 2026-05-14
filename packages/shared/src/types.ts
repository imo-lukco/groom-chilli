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