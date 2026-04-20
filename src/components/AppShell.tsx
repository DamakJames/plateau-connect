import { Outlet } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
