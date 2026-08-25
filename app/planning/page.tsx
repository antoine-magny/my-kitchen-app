"use client";

import { useEffect, useState } from "react";
import { PlanningBoard } from "@/components/planning/planning-board";
import { getStoredMealPlans, saveMealPlans, type DayPlan } from "@/lib/planning";

export default function PlanningPage() {
  const [plansByWeek, setPlansByWeek] = useState<Record<string, Record<string, DayPlan>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlansByWeek(getStoredMealPlans());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveMealPlans(plansByWeek);
    }
  }, [plansByWeek, ready]);

  return <PlanningBoard plansByWeek={plansByWeek} setPlansByWeek={setPlansByWeek} />;
}
