import { createAdminClient } from "@/lib/supabase/admin";

async function loadAisles() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("aisles")
    .select("id, name, display_order")
    .order("display_order");

  if (error) throw new Error(error.message);

  return data;
}

export default async function CoursesPage() {
  let aisles: Awaited<ReturnType<typeof loadAisles>> = [];
  let configError: string | null = null;

  try {
    aisles = await loadAisles();
  } catch (error) {
    configError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <p className="mb-0.5 text-xs font-semibold tracking-[0.1em] text-[#7A8F7D] uppercase">
          Liste
        </p>
        <h1 className="font-lora text-2xl font-bold text-[#1C2B1E]">Courses</h1>

        {configError ? (
          <div
            className="mt-6 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-4"
            role="alert"
          >
            <p className="text-sm font-bold text-[#C2410C]">Configuration incomplète</p>
            <p className="mt-1.5 text-sm font-medium text-[#9A3412]">{configError}</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium text-[#7A8F7D]">
              Votre liste est vide. Les rayons ci-dessous viennent de Supabase et serviront à
              classer vos articles.
            </p>

            <div
              className="mt-6 overflow-hidden rounded-2xl border border-[#E8EDE9] bg-white"
              style={{ boxShadow: "0 1px 12px rgba(28,43,30,0.06)" }}
            >
              {aisles.map((aisle, index) => (
                <div key={aisle.id}>
                  {index > 0 && <div className="ml-5 h-px bg-[#F0F4EF]" />}
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <span className="w-5 shrink-0 text-xs font-bold text-[#9CA3AF]">
                      {aisle.display_order}
                    </span>
                    <p className="text-sm font-bold text-[#1C2B1E]">{aisle.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 px-1 text-xs font-medium text-[#9CA3AF]">
              {aisles.length} rayons chargés depuis Supabase
            </p>
          </>
        )}
      </div>
    </div>
  );
}
