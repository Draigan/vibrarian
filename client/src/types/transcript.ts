export type TranscriptBlock = {
  id: number;
  created_at: string;
  transcript_id: string;
  start: number;
  duration: number;
  speaker: string;
  block: string;
}
export type Transcript = {
id: number;
crated_at: string;
date: string;
filename: string;
length_s: number;
}
