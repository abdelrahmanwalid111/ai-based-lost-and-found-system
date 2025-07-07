"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import { Loader2 } from "lucide-react";

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: colors.primary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              color: colors.primaryText,
              fontSize: '20px',
              fontWeight: '700',
            }}>
              L
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Loader2 size={20} style={{
              color: colors.textMuted,
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{
              color: colors.textMuted,
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Loading...
            </span>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Public pages (login, signin) - no layout
  const publicPages = ['/login', '/signin'];
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Protected pages - require authentication
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background,
      }}>
        <div style={{
          padding: '32px',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          boxShadow: colors.shadow,
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          margin: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: colors.primary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{
              color: colors.primaryText,
              fontSize: '20px',
              fontWeight: '700',
            }}>
              L
            </span>
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '8px',
            margin: 0,
          }}>
            Access Denied
          </h2>
          <p style={{
            color: colors.textMuted,
            fontSize: '14px',
            marginBottom: '24px',
            margin: 0,
          }}>
            Please sign in to access the admin portal
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              background: colors.primary,
              color: colors.primaryText,
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = colors.primary;
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Authenticated layout - single top navigation
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
    }}>
      <TopBar />
      <main style={{
        padding: '24px',
        paddingTop: '88px', // Account for fixed topbar
      }}>
        {children}
      </main>
    </div>
  );
};

export default ConditionalLayout; 