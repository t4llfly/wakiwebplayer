"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BotEvent,
  PlayerState,
  TrackInfo,
  CommandResult,
  SendCommand,
} from "@/lib/bot-types";
import { toast } from "sonner";

export interface LiveTrack extends TrackInfo {
  live_position_ms: number;
}

export interface LivePlayerState extends Omit<PlayerState, "current"> {
  current: LiveTrack | null;
}

export function useBotSocket() {
  const [rawState, setRawState] = useState<PlayerState | null>(null);
  const [liveState, setLiveState] = useState<LivePlayerState | null>(null);

  const lastUpdateRef = useRef<number>(0);

  const socketUrl =
    process.env.NEXT_PUBLIC_WS_URL || "wss://waki.tallfly.me/bot/ws";

  const handleCommandResult = useCallback((result: CommandResult) => {
    if ("error" in result) {
      toast.error(`Ошибка: ${result.error}`);
    } else if ("title" in result) {
      toast.success(`Добавлено: ${result.title}`);
    } else if ("success" in result) {
      // toast.success('Команда выполнена');
    }
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: BotEvent = JSON.parse(event.data);

        if (
          message.event === "INITIAL_STATE" ||
          message.event === "PLAYER_STATE"
        ) {
          setRawState(message.data);
          lastUpdateRef.current = Date.now();
        } else if (message.event === "POSITION_UPDATE") {
          setRawState((prev) => {
            if (!prev || !prev.current) return prev;
            return {
              ...prev,
              current: {
                ...prev.current,
                position_ms: message.data.position_ms,
              },
            };
          });
          lastUpdateRef.current = Date.now();
        } else if (message.event === "COMMAND_RESULT") {
          handleCommandResult(message.data);
        }
      } catch (e) {
        console.error("Ошибка WS:", e);
      }
    },
    [handleCommandResult],
  );

  const handleOpen = useCallback(() => {
    console.log("WS Connected");
  }, []);

  const handleClose = useCallback(() => {
    console.log("WS Disconnected");
  }, []);

  const shouldReconnect = useCallback(() => true, []);

  const options = useMemo(
    () => ({
      onOpen: handleOpen,
      onClose: handleClose,
      onMessage: handleMessage,
      shouldReconnect,
    }),
    [handleOpen, handleClose, handleMessage, shouldReconnect],
  );

  const { sendJsonMessage, readyState } = useWebSocket<BotEvent>(
    socketUrl,
    options,
  );

  useEffect(() => {
    if (!rawState) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceUpdate = now - lastUpdateRef.current;

      let liveCurrent: LiveTrack | null = null;

      if (rawState.current) {
        const elapsed = rawState.is_paused ? 0 : timeSinceUpdate;
        const newPosition = Math.min(
          rawState.current.position_ms + elapsed,
          rawState.current.length_ms,
        );

        liveCurrent = { ...rawState.current, live_position_ms: newPosition };
      }

      setLiveState({
        ...rawState,
        current: liveCurrent,
      });
    }, 250);
    return () => clearInterval(interval);
  }, [rawState]);

  const generateId = useCallback(() => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const sendCommand: SendCommand = useCallback(
    (action, payload) => {
      const request_id = generateId();
      const command = { action, payload, request_id };
      sendJsonMessage(command);
    },
    [sendJsonMessage, generateId],
  );

  return {
    playerState: liveState,
    sendCommand,
    isConnected: readyState === ReadyState.OPEN,
  };
}
