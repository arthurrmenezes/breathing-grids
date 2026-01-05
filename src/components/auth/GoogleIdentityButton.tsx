import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { googleAuthService, GOOGLE_CLIENT_ID } from "@/services/googleAuthService";

type GoogleIdentityButtonProps = {
  mode: "login" | "signup";
  disabled?: boolean;
  className?: string;
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
};

export function GoogleIdentityButton({
  mode,
  disabled,
  className,
  onCredential,
  onError,
}: GoogleIdentityButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const render = useCallback(() => {
    const el = containerRef.current;
    const google = (window as any).google;

    if (!el || !google?.accounts?.id) return;

    const width = Math.max(280, Math.round(el.getBoundingClientRect().width));

    el.innerHTML = "";
    google.accounts.id.renderButton(el, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: mode === "signup" ? "signup_with" : "continue_with",
      shape: "pill",
      width,
      logo_alignment: "left",
    });
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    const init = async () => {
      try {
        await googleAuthService.initialize();

        if (cancelled) return;

        if (!GOOGLE_CLIENT_ID) {
          onError?.(
            'Google Client ID não configurado. Preencha a constante GOOGLE_CLIENT_ID em src/services/googleAuthService.ts',
          );
          return;
        }

        const google = (window as any).google;
        if (!google?.accounts?.id) {
          onError?.("Google Identity Services não carregou.");
          return;
        }

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (resp?.credential) onCredential(resp.credential);
            else onError?.("Não foi possível obter a credencial do Google.");
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
        });

        render();

        if (containerRef.current) {
          ro = new ResizeObserver(() => render());
          ro.observe(containerRef.current);
        }

        setReady(true);
      } catch (e: any) {
        onError?.(e?.message || "Falha ao inicializar o Google.");
      }
    };

    init();

    return () => {
      cancelled = true;
      ro?.disconnect();
    };
  }, [onCredential, onError, render]);

  return (
    <div
      className={cn(
        "w-full min-h-12 rounded-full overflow-hidden border border-foreground/20 bg-background shadow-sm transition-colors hover:border-foreground/30",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      aria-busy={disabled || !ready}
    >
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
