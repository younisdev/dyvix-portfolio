"use client";

import { useRouter } from "next/navigation";
import AdminAuthShell from "../../components/admin/AdminAuthShell";
import React from "react";
import { DyvixModal, DyvixModalOverride, dyvixToast } from "dyvix-ui";
import { handleCreateUserAction, handleRegisterAction } from "@/auth/actions";
import { GetPresetsCount, GetRepoCachCount, GetUsersCount } from "@/service";
const MODAL_OVERRIDES = {
  "--dyvix-modal-backdrop-filter": "blur(8px)",
  "--dyvix-modal-padding": "12px 24px",
  "--dyvix-modal-color": "#f8fafc",
  "--dyvix-modal-letter-spacing": "-0.01em",
  "--dyvix-modal-border-width": "1px",
  "--dyvix-modal-border-style": "solid",
  "--dyvix-modal-border-radius": "8px",
  "--dyvix-modal-transition": "all 0.2s ease-in-out",
  "--dyvix-modal-bg": "rgba(15, 23, 42, 0.85)",
  "--dyvix-modal-font-family": "Geist",
  "--dyvix-modal-header-font-size": "2rem",
  "--dyvix-modal-button-bg": "#38bdf8",
  "--dyvix-modal-button-color": "#0f172a",
  "--dyvix-modal-z-index": "1000",
  "--dyvix-modal-display": "flex",
} as DyvixModalOverride;
export default function AdminPage() {
  const router = useRouter();
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);
  const [dashboardData, setData] = React.useState<{
    presetCount?: string | null;
    usersCount?: string | null;
    reposCount?: string | null;
  }>({ presetCount: null, usersCount: null, reposCount: null });

  React.useEffect(() => {
    async function getDashboardData() {
      const presetCount = await GetPresetsCount();
      const usersCount = await GetUsersCount();
      const cachedRepoCount = await GetRepoCachCount();
      if (presetCount.success) {
        setData((prev) => ({
          ...prev,
          presetCount: `${presetCount.data} presets`,
        }));
      }

      if (usersCount.success) {
        setData((prev) => ({
          ...prev,
          usersCount: `${usersCount.data} users`,
        }));
      }
      if (cachedRepoCount.success) {
        setData((prev) => ({
          ...prev,
          reposCount: `${cachedRepoCount.data} cached repos`,
        }));
      }
    }

    getDashboardData();
  }, []);
  return (
    <AdminAuthShell>
      <div className="flex flex-wrap admin-dashboard gap-3">
        <h2 className="flex flex-wrap w-full text-blue-300 mt-10 ml-10">
          <span className="section-header text-3xl font-bold">Dashboard</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          <div className="dashboard-item flex flex-col p-6 gap-5 justify-center">
            <h3 className="w-full flex flex-col text-center font-mono text-2xl font-extrabold text-[#8EC5FF] mb-2 select-none transition-all hover:text-[#439bf9]">
              Actions
            </h3>
            <span
              className="dashboard-action"
              onClick={() => {
                setShowRegisterModal(true);
              }}
            >
              Register new user
            </span>
            <span
              className="dashboard-action"
              onClick={() => {
                router.push("/admin/logout");
                router.refresh();
              }}
            >
              Logout
            </span>
          </div>
          <div className="dashboard-item flex flex-col p-6 gap-5 justify-center">
            <h3 className="w-full text-center font-mono text-2xl font-extrabold text-[#8EC5FF] mb-2 select-none">
              Quick Links
            </h3>
            <span
              className="dashboard-action text-center"
              onClick={() => window.open("/admin/config/presets")}
            >
              Preset Editor
            </span>
            <span
              className="dashboard-action text-center"
              onClick={() =>
                window.open("https://github.com/younisdev/dyvix-ui/", "_blank")
              }
            >
              Dyvix UI GitHub Repository
            </span>
            <span
              className="dashboard-action text-center"
              onClick={() =>
                window.open(
                  "https://github.com/younisdev/dyvix-portfolio",
                  "_blank",
                )
              }
            >
              Dyvix Portfolio GitHub Repository
            </span>
          </div>
          <div className="dashboard-item flex flex-row flex-wrap p-3 justify-center">
            <div className="p-6 flex flex-col items-center justify-center gap-2">
              <h4 className="w-full text-center font-mono text-2xl font-extrabold text-[#8EC5FF] mb-2 select-none">
                Preset Count
              </h4>
              <div className="text-xl font-mono text-teal-400 font-semibold bg-slate-950/40 px-4 py-2 rounded-xl border border-slate-800">
                {dashboardData.presetCount || "loading..."}
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center gap-2">
              <h4 className="w-full text-center font-mono text-2xl font-extrabold text-[#8EC5FF] mb-2 select-none">
                User Count
              </h4>
              <div className="text-xl font-mono text-teal-400 font-semibold bg-slate-950/40 px-4 py-2 rounded-xl border border-slate-800">
                {dashboardData.usersCount || "loading..."}
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center gap-2">
              <h4 className="w-full text-center font-mono text-2xl font-extrabold text-[#8EC5FF] mb-2 select-none">
                Cached Repository Count
              </h4>
              <div className="text-xl font-mono text-teal-400 font-semibold bg-slate-950/40 px-4 py-2 rounded-xl border border-slate-800">
                {dashboardData.reposCount || "loading..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <DyvixModal
          onSubmit={async (data) => {
            const res = await handleCreateUserAction(
              `${data["First Name"]} ${data["Last Name"]}`,
              data["email"],
              data["password"],
            );

            if (!res.success) {
              dyvixToast.error(res.error);
              return;
            }
            dyvixToast.success("User registered");
            setShowRegisterModal(false);
            router.refresh();
          }}
          style={{ position: "absolute", top: "5rem" }}
          onClose={() => setShowRegisterModal(false)}
          overrides={MODAL_OVERRIDES}
          title={"Register"}
          preset={"Register"}
        />
      )}
    </AdminAuthShell>
  );
}
