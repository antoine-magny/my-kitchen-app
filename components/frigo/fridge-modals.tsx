"use client";

import { AddModal } from "@/components/frigo/add-modal";
import { ClearAllModal } from "@/components/frigo/clear-all-modal";
import { EditDlcModal } from "@/components/frigo/edit-dlc-modal";
import { ExpiredModal } from "@/components/frigo/expired-modal";
import type { Ingredient, NewFridgeItem, TabId } from "@/components/frigo/shared";

export function FridgeModals({
  showModal,
  showClearAll,
  showExpired,
  editingItem,
  activeTab,
  activeTabLabel,
  tabItemsCount,
  expiredItems,
  onAdd,
  onCloseModal,
  onConfirmClearAll,
  onCloseClearAll,
  onCloseExpired,
  onEditDlc,
  onSaveDlc,
  onCloseDlc,
}: {
  showModal: boolean;
  showClearAll: boolean;
  showExpired: boolean;
  editingItem: Ingredient | null;
  activeTab: TabId;
  activeTabLabel: string;
  tabItemsCount: number;
  expiredItems: Ingredient[];
  onAdd: (draft: NewFridgeItem) => void;
  onCloseModal: () => void;
  onConfirmClearAll: () => void;
  onCloseClearAll: () => void;
  onCloseExpired: () => void;
  onEditDlc: (id: string) => void;
  onSaveDlc: (dlc: string | null) => void;
  onCloseDlc: () => void;
}) {
  return (
    <>
      {showModal && <AddModal activeTab={activeTab} onAdd={onAdd} onClose={onCloseModal} />}

      {showClearAll && tabItemsCount > 0 && (
        <ClearAllModal
          description={`Supprimer tous les éléments du ${activeTabLabel.toLowerCase()} ?`}
          itemCount={tabItemsCount}
          onConfirm={onConfirmClearAll}
          onClose={onCloseClearAll}
        />
      )}

      {showExpired && expiredItems.length > 0 && (
        <ExpiredModal
          items={expiredItems}
          tabLabel={activeTabLabel}
          onClose={onCloseExpired}
          onEditDlc={onEditDlc}
        />
      )}

      {editingItem && (
        <EditDlcModal item={editingItem} onSave={onSaveDlc} onClose={onCloseDlc} />
      )}
    </>
  );
}
