import { connection } from "next/server";
import { HomePage } from "@/components/home/home-page";
import { formatTodayLongFr } from "@/lib/date-paris";

export default async function Home() {
  await connection();
  return <HomePage todayLabel={formatTodayLongFr()} />;
}
