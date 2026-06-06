"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenLoader } from "@/components/ui/Spinner";

// Punto de entrada: enruta según la sesión.
export default function HomePage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    router.replace(user?.must_change_password ? "/change-password" : "/dashboard");
  }, [initialized, isAuthenticated, user, router]);

  return <FullScreenLoader />;
}
