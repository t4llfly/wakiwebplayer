"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Music,
  SkipForward,
  LogIn,
  LogOut,
  Play,
  X,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface playerData {
  current: {
    title: string;
    requester: string;
    position_ms: number;
    length_ms: number;
    artwork: string;
  };
  volume: number;
  queue: { title: string; length_ms: number }[];
  is_playing: boolean;
  is_paused: boolean;
}

const ADMIN_IDS_LIST = ["478115060791640105"];

export default function WakiPlayer() {
  const { data: session, status } = useSession();
  const [playerData, setPlayerData] = useState<playerData | null>(null);
  const [url, setUrl] = useState("");
  const [isSending, setIsSending] = useState(false);

  const userId: string = session?.user?.id || "";

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/bot/ws`;

      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        setPlayerData(JSON.parse(event.data));
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const handlePlay = async () => {
    if (!url || !session?.user?.id) return;
    setIsSending(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BOT_API + "/bot/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, user_id: session.user.id }),
      });
      const result = await res.json();

      if (result.error) {
        toast.error("Ошибка", {
          description: result.error,
          position: "bottom-center",
        });
      } else {
        toast.success("Добавлено", {
          description: `Добавила "${result.title}" в очередь.`,
          position: "bottom-center",
        });
        setUrl("");
      }
    } catch {
      toast.error("Оффлайн", {
        description: "Я сейчас не в сети.",
        position: "bottom-center",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_BOT_API + "/bot/skip", {
        method: "POST",
      });
      toast.success("Пропуск", {
        description: "Пропустила песню.",
        position: "bottom-center",
      });
    } catch {
      toast.error("Ошибка", {
        description: "Не смогла пропустить песню.",
        position: "bottom-center",
      });
    }
  };

  const handleRestart = async () => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BOT_API + "/bot/restart",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        },
      );
      const result = await res.json();
      if (result.success) {
        toast.success("Перезагрузка", {
          description: "Я перезагружаюсь.",
          position: "bottom-center",
        });
      } else {
        toast.error("Ошибка", {
          description: result.error,
          position: "bottom-center",
        });
      }
    } catch {
      toast.error("Ошибка", {
        description: "Не смогла перезагрузиться.",
        position: "bottom-center",
      });
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

  if (!playerData) return <Loader2 className="animate-spin m-auto" />;

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
            {ADMIN_IDS_LIST.includes(userId) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <RefreshCw />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="p-0 gap-0">
                  <div className="flex w-full p-2 bg-card text-xs ring-1 ring-foreground/10">
                    <p className="font-mono text-muted-foreground select-none">
                      restartalert.ts
                    </p>
                    <X className="w-4 h-4 ml-auto text-muted-foreground hover:text-foreground transition-colors" />
                  </div>
                  <AlertDialogHeader className="p-4">
                    <AlertDialogTitle>Ты уверен?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это принудительно перезапустит меня и переподключит к
                      серверам. Текущая музыка прервется, а очередь будет
                      очищена.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="p-4">
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRestart}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Перезагрузить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
          <Button onClick={handlePlay} size="icon" disabled={isSending || !url}>
            {isSending ? <Loader2 className="animate-spin" /> : <Play />}
          </Button>
        </div>

        {!playerData.is_playing ? (
          <div className="py-6 flex flex-col items-center opacity-50 border-2 border-dashed">
            <Music className="w-10 h-10 mb-2" />
            <p>В канале тишина</p>
          </div>
        ) : (
          <>
            <div className="relative w-full h-full overflow-hidden group mb-2 shadow-md">
              <Image
                src={playerData.current.artwork}
                className="w-full h-full object-cover"
                alt="cover"
                width={500}
                height={500}
              />
              {playerData.is_paused && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold tracking-widest backdrop-blur-sm">
                  ПАУЗА
                </div>
              )}
            </div>

            <h2
              className="font-bold text-lg leading-tight line-clamp-1"
              title={playerData.current.title}
            >
              {playerData.current.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
              Заказал: {playerData.current.requester}
            </p>

            <Progress
              value={
                (playerData.current.position_ms /
                  playerData.current.length_ms) *
                100
              }
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono mb-4">
              <span>{formatTime(playerData.current.position_ms)}</span>
              <span>{formatTime(playerData.current.length_ms)}</span>
            </div>

            <div className="flex justify-between items-center">
              <Badge variant="secondary">🔊 {playerData.volume}%</Badge>
              <Button onClick={handleSkip} variant="outline" size="sm">
                <SkipForward className="w-4 h-4 mr-2" /> Пропустить
              </Button>
            </div>
          </>
        )}

        {playerData.queue?.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">
              Далее в очереди
            </p>
            <div className="space-y-2 max-h-30 overflow-y-auto pr-2 custom-scrollbar">
              {playerData.queue.map(
                (track: { title: string; length_ms: number }, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="truncate pr-4 opacity-80">
                      {i + 1}. {track.title}
                    </span>
                    <span className="font-mono opacity-50 text-xs">
                      {formatTime(track.length_ms)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
