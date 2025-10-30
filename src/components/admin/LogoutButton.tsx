"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { logoutAndRedirect } from "@/app/admin/survey/actions";

/**
 * Logout button for admin dashboard
 * Performs logout and redirects to survey page
 */
export function LogoutButton() {
  const handleLogout = async () => {
    await logoutAndRedirect();
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
      <ArrowLeft className="h-4 w-4" />
      Înapoi la Survey
    </Button>
  );
}
