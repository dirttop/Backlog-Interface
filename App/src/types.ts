export interface Game {
  SteamAppId: number;
  Title: string;
  Genre?: string;
  Developer?: string;
  ReleaseYear?: number;
  Completed: boolean;
  CompletedOn?: string | null;
  Dropped: boolean;
  PlaytimeHours?: number;
  Rating?: number;
  Review?: string;
  ValidatedOn?: string | null;
}
