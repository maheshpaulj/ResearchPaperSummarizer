"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/profile");
    }
  }, [session, router]);

  // Sign In Form State
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinError, setSigninError] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);

  // Register Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninLoading(true);
    setSigninError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: signinEmail,
        password: signinPassword,
      });

      if (result?.error) {
        setSigninError("Invalid email or password");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      setSigninError("Something went wrong");
      console.error(error);
    } finally {
      setSigninLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setActiveTab("signin");
      setSigninEmail(email);
    } catch (error) {
      setRegisterError("Registration failed");
      console.error(error);
    } finally {
      setRegisterLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome Back
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSignIn}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="signin-email"
                    type="email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </motion.div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="signin-password"
                    type="password"
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </motion.div>
              </div>
              {signinError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm"
                >
                  {signinError}
                </motion.p>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={signinLoading}
                  className="w-full"
                >
                  {signinLoading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>
            </motion.form>
          </TabsContent>

          <TabsContent value="register">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRegister}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </motion.div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </motion.div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                  />
                </motion.div>
              </div>
              {registerError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm"
                >
                  {registerError}
                </motion.p>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {registerLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </motion.div>
            </motion.form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}