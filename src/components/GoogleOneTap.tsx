import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID = "257165237508-s8ip9mrrcc6816utk2r336v2s41kmk7i.apps.googleusercontent.com"; 

declare global {
  interface Window {
    google: any;
  }
}

const GoogleOneTap = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        initializeGoogleOneTap();
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        initializeGoogleOneTap();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeGoogleOneTap = () => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          cancel_on_tap_outside: false, 
          context: 'signin',
          use_fedcm_for_prompt: false, // Force disable FedCM to avoid 'unknown_reason'
          itp_support: true, // Support for ITP browsers
        });
        
        // Display the One Tap prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn("Google One Tap hidden:", notification.getNotDisplayedReason());
          }
        });
      }
    };
    document.body.appendChild(script);
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      toast.success("Đăng nhập bằng Google thành công!");
      navigate(0); // Refresh page to ensure state updates or redirect
    } catch (error: any) {
      console.error("Google One Tap Error:", error);
      toast.error(`Lỗi: ${error.message || JSON.stringify(error)}`);
    }
  };

  return null;
};

export default GoogleOneTap;
