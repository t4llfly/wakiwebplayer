"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Music,
  SkipForward,
  LogIn,
  LogOut,
  Play,
  X,
  Pause,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { useBotSocket } from "@/hooks/useBotSocket";
import { VoiceMembers } from "./VoiceMembers";
import { QueueManager } from "./QueueManager";
import { SmoothProgress } from "./SmoothProgress";

export default function WakiPlayer() {
  const { data: session, status } = useSession();
  const { playerState, sendCommand } = useBotSocket();
  const [url, setUrl] = useState("");
  const userId: string = session?.user?.id || "";

  const handlePlay = () => {
    if (!url || !session?.user?.id) return;
    sendCommand("play", { url, user_id: session.user.id });
    setUrl("");
  };

  const handleSkip = () => {
    sendCommand("skip", { user_id: userId });
  };

  const handlePauseResume = () => {
    if (playerState?.is_paused) {
      sendCommand("resume");
    } else {
      sendCommand("pause");
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (status === "loading") return <Loader2 className="animate-spin m-auto" />;

  if (status === "unauthenticated") {
    return (
      <div>
        <div className="flex w-full bg-card p-2 text-xs ring-1 ring-foreground/10">
          <p className="font-mono text-muted-foreground select-none">
            welcome.ts
          </p>
          <X className="w-4 h-4 ml-auto text-muted-foreground hover:text-foreground transition-colors" />
        </div>
        <Card className="p-4 flex flex-col items-center gap-2 w-100">
          <Music className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Waki Web Player</h2>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Войди через Discord, чтобы я поняла, в каком ты голосовом канале.
          </p>
          <Button onClick={() => signIn("discord")} className="w-full">
            <LogIn className="w-4 h-4 mr-2" /> Войти через Discord
          </Button>
        </Card>
      </div>
    );
  }

  if (!playerState) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="absolute top-5 right-5">
            info
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 gap-0" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between p-2">
            <p className="text-muted-foreground">info.ts</p>
            <DialogClose asChild>
              <X className="w-4 h-4 ml-auto text-muted-foreground hover:text-foreground transition-colors" />
            </DialogClose>
          </DialogHeader>
          <div className="flex flex-col border-t ring-foreground/10 p-4 gap-2">
            <p>made by tallfly.</p>
            <div>
              <Button
                onClick={() =>
                  window.open("https://github.com/t4llfly/wakimusicplayer")
                }
                size="xs"
              >
                source code
              </Button>
              <Button
                onClick={() => window.open("https://tallfly.me")}
                variant="secondary"
                size="xs"
              >
                about me
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex w-full bg-card p-2 text-xs ring-1 ring-foreground/10">
        <p className="font-mono text-muted-foreground select-none">waki.ts</p>
        <X className="w-4 h-4 ml-auto text-muted-foreground hover:text-foreground transition-colors" />
      </div>
      <Card className="p-4 gap-2 w-150 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium opacity-80">
            Привет, {session?.user?.name}
          </div>
          <div>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Ссылка или название"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlay()}
          />
          <Button onClick={handlePlay} size="icon" disabled={!url}>
            <Play />
          </Button>
        </div>

        {!playerState.is_playing ? (
          <div className="py-6 flex flex-col items-center opacity-50 border-2 border-dashed mb-2">
            <Music className="w-10 h-10 mb-2" />
            <p>В канале тишина</p>
          </div>
        ) : (
          <>
            <div className="relative w-full h-full overflow-hidden group mb-2 shadow-md">
              <Image
                src={playerState.current?.artwork || ""}
                className="w-full h-full object-cover"
                alt="cover"
                width={500}
                height={500}
              />
              {playerState.is_paused && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold tracking-widest backdrop-blur-sm">
                  ПАУЗА
                </div>
              )}
            </div>

            <h2
              className="font-bold text-lg leading-tight line-clamp-1"
              title={playerState.current?.title}
            >
              {playerState.current?.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
              Заказал: {playerState.current?.requester}
            </p>

            <SmoothProgress
              value={
                playerState.current
                  ? (playerState.current.live_position_ms /
                      playerState.current.length_ms) *
                    100
                  : 0
              }
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono mb-4">
              <span>
                {formatTime(playerState.current?.live_position_ms || 0)}
              </span>
              <span>{formatTime(playerState.current?.length_ms || 0)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center">
          {playerState.voice_members &&
            playerState.voice_members.length > 0 && (
              <VoiceMembers members={playerState.voice_members} />
            )}
          <div className="flex-2" />
          <div className="flex gap-2">
            <Button
              onClick={handlePauseResume}
              variant="outline"
              disabled={!playerState.is_playing}
              size="sm"
            >
              {playerState.is_paused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              size="sm"
              disabled={!playerState.is_playing}
            >
              <SkipForward className="w-4 h-4 mr-2" /> Пропустить
            </Button>
          </div>
        </div>

        <QueueManager
          queue={playerState.queue || []}
          sendCommand={sendCommand}
        />
      </Card>
    </div>
  );
}
