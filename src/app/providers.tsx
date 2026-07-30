"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/actions/user";
import { getAssignedKitchenDetails } from "@/actions/kitchen";
import { useStore } from "@/lib/store";

function AuthSync() {
  const setProfile = useStore((s) => s.setProfile);

  useEffect(() => {
    const syncUserAndKitchen = async () => {
      // 1. Sync kitchen details from server cookie / DB
      const kitchenDetails = await getAssignedKitchenDetails();
      if (kitchenDetails?.code) {
        useStore.getState().resolveLocation(kitchenDetails.code);
      }

      // 2. Sync user profile
      const user = await getCurrentUser();
      if (user) {
        setProfile({
          name: user.name,
          phone: user.phone,
          address: user.address || "",
          branchId: kitchenDetails?.code || useStore.getState().branchId,
          email: user.email,
          role: user.role,
          joinedDate: user.joinedDate,
        });
      }
    };
    syncUserAndKitchen();
  }, [setProfile]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}
