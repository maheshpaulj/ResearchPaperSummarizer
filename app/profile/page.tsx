"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface UserUpdateData {
  userId: string;
  name: string;
}

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/signin");
    return null;
  }


  const handleUpdateName = async () => {
    if (!name || name === session.user.name || !session.user.id) return;
  
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, name } as UserUpdateData),
      });
  
      if (res.ok) {
        console.log(session.user.name)
        await update({ name }); // 🔥 Refresh session data
        console.log(session.user.name)
        await update();
        console.log(session.user.name)
        setIsEditing(false);
      } else {
        console.error("Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action is irreversible.")) return;
    if (!session.user.id) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (res.ok) {
        signOut({ callbackUrl: "/signin" });
      } else {
        console.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex pt-40 items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl border border-gray-200 bg-white rounded-lg">
        {/* Profile Section */}
        <CardHeader className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session.user.image || "/default-avatar.png"} alt="Profile picture" />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            {session.user.name}
          </CardTitle>
          <p className="text-gray-500 text-sm">{session.user.email}</p>
        </CardHeader>

        <CardContent className="px-6 space-y-5">
          {/* Name Section */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">Name</Label>
            <div className="flex items-center gap-3">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300"
                disabled={!isEditing}
              />
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="text-sm">
                  Change Name
                </Button>
              ) : (
                <Button 
                  onClick={handleUpdateName} 
                  disabled={isUpdating || !name || name === session.user.name} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdating ? "Updating..." : "Save"}
                </Button>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Sign Out
          </Button>
        </CardContent>

        {/* Separator */}
        <Separator className="my-3" />

        {/* Delete Section */}
        <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
          <p className="text-sm text-gray-500">
            Deleting your account is irreversible. All your data will be permanently removed.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
