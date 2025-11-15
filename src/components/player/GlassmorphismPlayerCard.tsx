import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import { cn } from "@/lib/utils";
import { MapPin, User } from "lucide-react";
import { PlayerProfile } from "../../lib/supabase";

interface GlassmorphismPlayerCardProps {
  player: PlayerProfile;
  className?: string;
}

export default function GlassmorphismPlayerCard({
  player,
  className,
}: GlassmorphismPlayerCardProps) {
  // Get recruiting status color
  const getRecruitingStatusColor = () => {
    switch (player.recruiting_status) {
      case "open":
        return "bg-green-500";
      case "committed":
        return "bg-[rgb(0,113,227)]";
      case "closed":
        return "bg-red-500";
      default:
        return "bg-[rgb(134,142,150)]";
    }
  };

  // Get recruiting status text
  const getRecruitingStatusText = () => {
    switch (player.recruiting_status) {
      case "open":
        return "Open to Recruiting";
      case "committed":
        return "Committed";
      case "closed":
        return "Not Recruiting";
      default:
        return "Status Unknown";
    }
  };

  // Get position display (handle array)
  const positionDisplay = Array.isArray(player.position)
    ? player.position[0]
    : player.position;

  return (
    <Link to={`/players/${player.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn("relative w-full", className)}
      >
        <Card
          className={cn(
            "relative mx-auto w-full rounded-[20px]",
            "bg-white/90 backdrop-blur-xl",
            "border border-slate-200/50",
            "shadow-lg shadow-black/5",
            "hover:shadow-xl hover:shadow-[rgb(0,113,227)]/20 hover:border-[rgb(0,113,227)]/30",
            "transition-all duration-300"
          )}
          padding="lg"
          hover={false}
        >
          {/* Recruiting Status */}
          <div className="mb-6 flex items-center gap-2">
            <span
              className={cn(
                "inline-block h-2.5 w-2.5 rounded-full animate-pulse",
                getRecruitingStatusColor()
              )}
            />
            <span className="select-none text-[rgb(134,142,150)] text-xs">
              {getRecruitingStatusText()}
            </span>
          </div>

          {/* Player Avatar & Info */}
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-[20px] ring-2 ring-[rgb(0,113,227)]/20 shadow-md">
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={`${player.profiles?.full_name || "Player"} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <User className="w-20 h-20 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 text-center">
              <h3 className="truncate text-xl font-bold tracking-tight text-[rgb(29,29,31)]">
                {player.profiles?.full_name || "Anonymous Player"}
              </h3>
              <p className="mt-1 text-sm text-[rgb(134,142,150)] font-medium">
                {player.sport}
                {positionDisplay && ` • ${positionDisplay}`}
              </p>

              {/* Location */}
              {(player.location_city || player.location_state) && (
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[rgb(134,142,150)]">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {player.location_city && player.location_state
                      ? `${player.location_city}, ${player.location_state}`
                      : player.location_city || player.location_state}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
