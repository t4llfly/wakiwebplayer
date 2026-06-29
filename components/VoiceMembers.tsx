"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MicOff, Headphones } from "lucide-react";
import { VoiceMember } from "@/lib/bot-types";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface VoiceMembersProps {
  members: VoiceMember[];
}

export function VoiceMembers({ members }: VoiceMembersProps) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      <AnimatePresence>
        {members.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-1 group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-7 h-7 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="absolute -bottom-2 right-0 flex gap-1 bg-card rounded-full p-1">
                    {member.is_muted && (
                      <MicOff className="w-2 h-2 text-destructive" />
                    )}
                    {member.is_deafened && (
                      <Headphones className="w-2 h-2 text-yellow-500" />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{member.name}</TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
