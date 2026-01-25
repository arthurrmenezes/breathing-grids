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
  const lastWidthRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  const render = useCallback(() => {
    const el = containerRef.current;
    const google = (window as any).google;

    if (!el || !google?.accounts?.id) return;

    const measured = Math.round(el.getBoundingClientRect().width);
    // O botão do Google tem limites de largura; clamp evita "sobrar" espaço e evita loops de resize.
    const width = Math.min(400, Math.max(280, measured));

    if (Math.abs(width - lastWidthRef.current) < 1) return;
    lastWidthRef.current = width;

    // Clear container safely without innerHTML to prevent XSS risk
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
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
          onError?.('Login com Google não está disponível no momento. Tente novamente mais tarde.');
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
        // 400px é o máximo que o botão do Google suporta sem "sobrar" espaço.
        "w-full max-w-[400px] mx-auto h-11 rounded-full overflow-hidden border border-foreground/25 bg-background shadow-sm transition-colors hover:border-foreground/35",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      aria-busy={disabled || !ready}
    >
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
