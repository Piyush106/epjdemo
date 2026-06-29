"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Please check your email to verify your account." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title="Register – EP Journals Group" description="Create an account with EP Journals Group." noindex />
      <Header />
      <section className="py-8 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground">Register</h1>
          <p className="text-muted-foreground text-sm">Create an account with EP Journals Group</p>
        </div>
      </section>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4 border border-border p-6 bg-card">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Register"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Signup;
