"use client";

import { FilterIcon, HeartIcon } from "@/components/icons";
import {
  RECIPE_TAG_COLORS,
  RECIPE_TAG_LABELS,
  RECIPE_TAGS,
  type RecipeTag,
} from "@/lib/recipes";

const PILL_TAGS: RecipeTag[] = [...RECIPE_TAGS];

export function RecipeFilterPills({
  selectedTags,
  favoritesOnly,
  favoriteCount,
  tagCounts,
  totalCount,
  advancedCount,
  onSelectTout,
  onToggleFavoris,
  onToggleTag,
  onOpenFilters,
}: {
  selectedTags: RecipeTag[];
  favoritesOnly: boolean;
  favoriteCount: number;
  tagCounts: Record<RecipeTag, number>;
  totalCount: number;
  advancedCount: number;
  onSelectTout: () => void;
  onToggleFavoris: () => void;
  onToggleTag: (tag: RecipeTag) => void;
  onOpenFilters: () => void;
}) {
  const toutActive = selectedTags.length === 0 && !favoritesOnly;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip
        label="Tout"
        count={totalCount}
        active={toutActive}
        onClick={onSelectTout}
      />
      <FilterChip
        label="Favoris"
        count={favoriteCount}
        active={favoritesOnly}
        favoris
        onClick={onToggleFavoris}
      />
      {PILL_TAGS.map((tag) => (
        <FilterChip
          key={tag}
          label={RECIPE_TAG_LABELS[tag]}
          count={tagCounts[tag]}
          active={selectedTags.includes(tag)}
          tag={tag}
          onClick={() => onToggleTag(tag)}
        />
      ))}
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200"
        style={{
          background: advancedCount > 0 ? "#1C2B1E" : "#FFFFFF",
          color: advancedCount > 0 ? "#FFFFFF" : "#4A7C59",
          border: advancedCount > 0 ? "1.5px solid #1C2B1E" : "1.5px solid #C8E0CF",
          boxShadow:
            advancedCount > 0
              ? "0 4px 12px rgba(28,43,30,0.18)"
              : "0 1px 4px rgba(28,43,30,0.05)",
        }}
        aria-label="Filtres avancés"
      >
        <FilterIcon size={14} />
        Filtres
        {advancedCount > 0 ? (
          <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[11px]">
            {advancedCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function chipStyle(active: boolean, favoris?: boolean, tag?: RecipeTag) {
  if (favoris) {
    return {
      background: active ? "#E85D75" : "#FFFFFF",
      color: active ? "#FFFFFF" : "#E85D75",
      border: `1.5px solid ${active ? "#E85D75" : "#F9C5CF"}`,
      boxShadow: active ? "0 4px 12px rgba(232,93,117,0.25)" : "0 1px 4px rgba(28,43,30,0.05)",
    };
  }
  if (tag) {
    const { accent, accentSoft, accentShadow, text } = RECIPE_TAG_COLORS[tag];
    return {
      background: active ? accent : "#FFFFFF",
      color: active ? text : accent,
      border: `1.5px solid ${active ? accent : accentSoft}`,
      boxShadow: active ? `0 4px 12px ${accentShadow}` : "0 1px 4px rgba(28,43,30,0.05)",
    };
  }
  return {
    background: active ? "#1C2B1E" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#4A7C59",
    border: `1.5px solid ${active ? "#1C2B1E" : "#C8E0CF"}`,
    boxShadow: active ? "0 4px 12px rgba(28,43,30,0.18)" : "0 1px 4px rgba(28,43,30,0.05)",
  };
}

function FilterChip({
  label,
  count,
  active,
  favoris,
  tag,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  favoris?: boolean;
  tag?: RecipeTag;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200"
      style={chipStyle(active, favoris, tag)}
    >
      {favoris ? (
        <span className="flex items-center">
          <HeartIcon filled={active} light={active} />
        </span>
      ) : null}
      {label}
      <span className="ml-1 text-xs" style={{ opacity: active ? 0.6 : 0.55 }}>
        {count}
      </span>
    </button>
  );
}
