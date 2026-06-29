export interface TrackInfo {
  title: string;
  author: string;
  uri: string;
  position_ms: number;
  length_ms: number;
  artwork: string;
  requester: string;
}

export interface QueueItem {
  title: string;
  length_ms: number;
  requester: string;
}

export interface VoiceMember {
  id: string;
  name: string;
  avatar: string;
  is_muted: boolean;
  is_deafened: boolean;
}

export interface PlayerState {
  is_playing: boolean;
  is_paused: boolean;
  volume: number;
  channel_name: string | null;
  current: TrackInfo | null;
  queue: QueueItem[];
  voice_members: VoiceMember[];
}

// commands here ====================================================================

export interface PlayPayload {
  url: string;
  user_id: string;
}

export interface SkipPayload {
  user_id: string;
}

export interface VolumePayload {
  level: number;
}

export interface RemoveTrackPayload {
  index: number;
}

export interface MoveTrackPayload {
  from_index: number;
  to_index: number;
}

export type BotCommand =
  | { action: "play"; payload: PlayPayload; request_id: string }
  | { action: "skip"; payload: SkipPayload; request_id: string }
  | { action: "volume"; payload: VolumePayload; request_id: string }
  | { action: "pause"; payload?: never; request_id: string }
  | { action: "resume"; payload?: never; request_id: string }
  | { action: "stop"; payload?: never; request_id: string }
  | { action: "remove_track"; payload: RemoveTrackPayload; request_id: string }
  | { action: "clear_queue"; payload?: never; request_id: string }
  | { action: "move_track"; payload: MoveTrackPayload; request_id: string };

export type BotAction = BotCommand["action"];

// ==================================================================================

// events here ======================================================================

export interface PlayResult {
  success: true;
  title: string;
  is_playlist: boolean;
}

export interface SkipResult {
  success: true;
}

export interface VolumeResult {
  success: true;
  level: number;
}

export interface RemoveTrackResult {
  success: true;
}

export interface ClearQueueResult {
  success: true;
}

export interface MoveTrackResult {
  success: true;
}

export interface PauseResult {
  success: true;
}

export interface ResumeResult {
  success: true;
}

export interface StopResult {
  success: true;
}

export interface ErrorResult {
  error: string;
}

export type CommandResult =
  | PlayResult
  | SkipResult
  | VolumeResult
  | RemoveTrackResult
  | ClearQueueResult
  | MoveTrackResult
  | PauseResult
  | ResumeResult
  | StopResult
  | ErrorResult;

export type BotEvent =
  | { event: "INITIAL_STATE"; data: PlayerState }
  | { event: "PLAYER_STATE"; data: PlayerState }
  | { event: "POSITION_UPDATE"; data: { position_ms: number } }
  | { event: "COMMAND_RESULT"; request_id: string; data: CommandResult };

// ==================================================================================

export type SendCommand = <T extends BotAction>(
  action: T,
  payload?: Extract<BotCommand, { action: T }> extends { payload: infer P }
    ? P extends never
      ? undefined
      : P
    : undefined,
) => void;
