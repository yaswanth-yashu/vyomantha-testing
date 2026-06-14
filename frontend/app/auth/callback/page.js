// app/auth/callback/page.js
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Exchange token with Frappe for user info
    fetch(
      `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/academy_portal.api.verify_login_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // Save user info in localStorage (or use NextAuth/cookies)
          localStorage.setItem("frappe_user", JSON.stringify(data.message));
          router.push("/");  // Go to dashboard
        } else {
          router.push("/login?error=invalid_token");
        }
      })
      .catch(() => router.push("/login?error=server_error"));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
}