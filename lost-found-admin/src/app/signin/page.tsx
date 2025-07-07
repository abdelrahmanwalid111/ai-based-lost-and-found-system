"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, isAuthenticated, isAdmin } = useAuth();
  const { colors } = useTheme();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      console.log('[SignIn] User already authenticated, redirecting...');
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('[SignIn] Attempting to sign in with:', { email: formData.email, password: '[HIDDEN]' });

    try {
      await signIn(formData.email, formData.password);
      console.log('[SignIn] Sign in successful, redirecting...');
      router.push('/');
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.background,
      padding: '16px',
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        boxShadow: colors.shadow,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: '8px',
            margin: 0,
          }}>
            LostLink
          </h1>
          
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: '8px',
            margin: 0,
          }}>
            Admin Sign In
          </h2>
          
          <p style={{
            color: colors.textMuted,
            fontSize: '14px',
            margin: 0,
          }}>
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '24px',
          }}>
            <p style={{
              color: colors.error,
              fontSize: '14px',
              margin: 0,
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
                background: colors.surface,
                color: colors.textPrimary,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
              }}
              placeholder="admin@lostlink.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '48px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = colors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} style={{ color: colors.textMuted }} />
                ) : (
                  <Eye size={16} style={{ color: colors.textMuted }} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: isLoading ? colors.textMuted : colors.primary,
              color: colors.primaryText,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.primary;
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${colors.primaryText}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.borderLight}`,
        }}>
          <p style={{
            color: colors.textMuted,
            fontSize: '12px',
            margin: 0,
          }}>
            LostLink Admin Dashboard
          </p>
        </div>
      </div>
    </div>
  );
} 