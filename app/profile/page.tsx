"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user.name) {
      setName(session.user.name);
    }
  }, [session]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === "unauthenticated" || !session) {
    router.push("/signin");
    return null;
  }

  const handleUpdateName = async () => {
    if (!name || name === session.user.name) return;

    setLoading(true);
    console.log("User ID from client:", session.user.id); // Debug

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, name }), // Pass userId
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Failed to update name:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setLoading(true);
    console.log("User ID from client:", session.user.id); // Debug

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }), // Pass userId
      });

      if (res.ok) {
        signOut({ callbackUrl: "/signin" });
      } else {
        const errorData = await res.json();
        console.error("Failed to delete account:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {session.user.email}
            </p>
            <div>
              <label htmlFor="name" className="text-gray-700 font-semibold">
                Name:
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleUpdateName}
              disabled={loading || !name || name === session.user.name}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update Name"}
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Sign Out
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}