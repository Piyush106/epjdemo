"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title="Sign In – EP Journals Group" description="Sign in to EP Journals Group administrative panel." noindex />
      <Header />
      <section className="py-8 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground">Sign In</h1>
          <p className="text-muted-foreground text-sm">Administrative access to EP Journals Group</p>
        </div>
      </section>
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4 border border-border p-6 bg-card">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline">Register</Link>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Login;
