"use client";

import { useEffect, useState } from "react";
import {
  loadPreferredFridgeInventory,
  type FridgeInventorySnapshot,
} from "@/lib/load-fridge-inventory";

type InventoryState = FridgeInventorySnapshot & { ready: boolean };

export function useFridgeInventory(): InventoryState {
  const [inventory, setInventory] = useState<InventoryState>({
    ready: false,
    items: [],
    usableCount: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      const snapshot = await loadPreferredFridgeInventory();
      if (!cancelled) {
        setInventory({ ready: true, ...snapshot });
      }
    }

    void loadInventory();
    return () => {
      cancelled = true;
    };
  }, []);

  return inventory;
}
