"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/actions/user";
import { useStore } from "@/lib/store";

function AuthSync() {
  const setProfile = useStore(s => s.setProfile);
  
  useEffect(() => {
    const syncUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setProfile({
          name: user.name,
          phone: user.phone,
          address: user.address || "",
          branchId: useStore.getState().branchId, // keep current or overwrite
          email: user.email,
          role: user.role,
          joinedDate: user.joinedDate
        });
      }
    };
    syncUser();
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
