"use client";

import { useEffect, useState } from "react";
import { BellIcon, CheckIcon, SmartphoneIcon } from "@/components/icons";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

type BrowserPermissionCardProps = {
  browserPushEnabled: boolean;
  onTogglePush: (enabled: boolean) => void;
};

export function BrowserPermissionCard({
  browserPushEnabled: _browserPushEnabled,
  onTogglePush,
}: BrowserPermissionCardProps) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const status = await Notification.requestPermission();
      setPermission(status as PermissionState);
      if (status === "granted") {
        onTogglePush(true);
      } else {
        onTogglePush(false);
      }
    } catch (e) {
      console.error("Erreur lors de la demande de permission", e);
    }
  };

  const triggerTestNotification = () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      permission !== "granted"
    ) {
      return;
    }
    try {
      new Notification("My Kitchen App 🥑", {
        body: "Vos notifications sont parfaitement configurées !",
        icon: "/favicon.ico",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (e) {
      console.error("Impossible d'afficher la notification test", e);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-[#FAFBF9] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF2EC] text-[#4A7C59]">
          <SmartphoneIcon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#1C2B1E]">Autorisation du navigateur</h3>
          <p className="text-xs text-[#7A8F7D]">
            {permission === "granted"
              ? "Notifications autorisées sur cet appareil"
              : permission === "denied"
                ? "Bloquées dans les paramètres du navigateur"
                : permission === "unsupported"
                  ? "Non supporté sur ce navigateur"
                  : "Activez pour recevoir les alertes en direct"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {permission !== "granted" && permission !== "unsupported" && (
          <button
            type="button"
            onClick={requestPermission}
            className="flex items-center gap-2 rounded-xl bg-[#4A7C59] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#3d6849] cursor-pointer"
          >
            <BellIcon size={14} />
            Autoriser les notifications
          </button>
        )}
        {permission === "granted" && (
          <button
            type="button"
            onClick={triggerTestNotification}
            className="flex items-center gap-2 rounded-xl border border-[#D1DDD2] bg-white px-3 py-2 text-xs font-bold text-[#2E5C3A] transition hover:bg-[#F0F4EF] cursor-pointer"
          >
            {testSent ? <CheckIcon size={14} /> : <BellIcon size={14} />}
            {testSent ? "Notification envoyée !" : "Tester une notification"}
          </button>
        )}
      </div>
    </div>
  );
}
