"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already_unsubscribed");
        else setStatus("invalid");
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already_unsubscribed");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  const content: Record<Status, React.ReactNode> = {
    loading: (
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Validating your request…</p>
      </div>
    ),
    valid: (
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-ep-orange" />
        <h2 className="text-lg font-heading font-semibold text-foreground">Unsubscribe from Emails</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          You are about to unsubscribe from transactional emails sent by EP Journals Group.
          You will no longer receive submission confirmations or editorial notifications at this address.
        </p>
        <Button onClick={handleUnsubscribe} disabled={processing} className="min-w-[180px]">
          {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing…</> : "Confirm Unsubscribe"}
        </Button>
      </div>
    ),
    success: (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h2 className="text-lg font-heading font-semibold text-foreground">Unsubscribed</h2>
        <p className="text-sm text-muted-foreground">You have been successfully unsubscribed.</p>
      </div>
    ),
    already_unsubscribed: (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold text-foreground">Already Unsubscribed</h2>
        <p className="text-sm text-muted-foreground">This email address has already been unsubscribed.</p>
      </div>
    ),
    invalid: (
      <div className="flex flex-col items-center gap-3 text-center">
        <XCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-heading font-semibold text-foreground">Invalid Link</h2>
        <p className="text-sm text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
      </div>
    ),
    error: (
      <div className="flex flex-col items-center gap-3 text-center">
        <XCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-heading font-semibold text-foreground">Something Went Wrong</h2>
        <p className="text-sm text-muted-foreground">We couldn't process your request. Please try again later.</p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title="Unsubscribe – EP Journals Group" description="Manage your email preferences." noindex />
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-xl">
        {content[status]}
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
