"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar } from "@/components/ui/avatar";

const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return (await api.post("/users/me/avatar", form)).data;
    },
    onSuccess: (updated) => {
      const current = useAuthStore.getState().user;
      if (current) useAuthStore.setState({ user: { ...current, avatarUrl: updated.avatarUrl } });
      toast.success("Photo de profil mise à jour.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function onPick(file?: File) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image trop lourde (3 Mo maximum).");
      return;
    }
    mutation.mutate(file);
  }

  return (
    <div className="flex items-center gap-5">
      <motion.button
        type="button"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current?.click()}
        className="group relative rounded-full"
        aria-label="Changer la photo de profil"
      >
        <Avatar src={user?.avatarUrl} name={user?.fullName} size="xl" />
        <motion.span
          variants={{ hover: { opacity: 1 }, rest: { opacity: 0 } }}
          initial="rest"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50 text-white"
        >
          <Camera className="h-6 w-6" />
        </motion.span>
        <AnimatePresence>
          {mutation.isPending && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div>
        <p className="font-semibold text-ink">{user?.fullName}</p>
        <p className="text-sm text-ink-muted">JPG, PNG ou WebP — 3 Mo maximum.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Changer la photo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
