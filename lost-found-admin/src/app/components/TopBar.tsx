"use client";

import { useState, useEffect } from "react";
import { User, LogOut, LayoutDashboard, FileText, Users, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const { user, signOut, isAdmin } = useAuth();
  const { theme, colors, toggleTheme, isHydrated } = useTheme();
  const pathname = usePathname();

  // Sync current theme state for proper icon display
  useEffect(() => {
    if (isHydrated) {
      setCurrentTheme(theme);
    } else if (typeof window !== 'undefined') {
      // Use the theme applied by the pre-hydration script
      const initialTheme = (window as any).__INITIAL_THEME__ || 
        (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setCurrentTheme(initialTheme);
    }
  }, [theme, isHydrated]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: pathname === '/',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      current: pathname.startsWith('/reports'),
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      current: pathname.startsWith('/users'),
      adminOnly: true,
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const handleSignOut = async () => {
    setShowUserMenu(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleThemeToggle = () => {
    // Optimistically update the current theme for immediate UI feedback
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <header style={{
      height: '64px',
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: '100%',
        gap: '24px',
      }}>
        {/* Project Name */}
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          minWidth: 'fit-content',
        }}>
          LostLink
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
        }}>
        {filteredNavigation.map((item) => {
          const isActive = item.current;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? colors.primary : colors.textMuted,
                background: isActive ? (currentTheme === 'light' ? '#eff6ff' : '#1e3a8a20') : 'transparent',
                border: isActive ? `1px solid ${currentTheme === 'light' ? '#dbeafe' : '#1e3a8a40'}` : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.background = colors.surfaceHover;
                  (e.target as HTMLElement).style.color = colors.textSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = colors.textMuted;
                }
              }}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right side - Theme Toggle, User */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        minWidth: 'fit-content',
      }}>
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          style={{
            padding: '8px',
            background: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: isHydrated ? 1 : 0.8,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = colors.surfaceHover;
            (e.target as HTMLButtonElement).style.borderColor = colors.borderLight;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.target as HTMLButtonElement).style.borderColor = colors.border;
          }}
          title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {currentTheme === 'light' ? (
            <Moon size={18} style={{ color: colors.textMuted }} />
          ) : (
            <Sun size={18} style={{ color: colors.textMuted }} />
          )}
        </button>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = colors.surfaceHover;
              (e.target as HTMLButtonElement).style.borderColor = colors.borderLight;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.borderColor = colors.border;
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              background: colors.surfaceHover,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={14} style={{ color: colors.textMuted }} />
            </div>
            <div style={{ textAlign: 'left' }}
            className="hidden sm:block">
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: colors.textPrimary,
                lineHeight: 1,
              }}>
                {user?.firstname} {user?.lastname}
              </div>
              <div style={{
                fontSize: '11px',
                color: colors.textMuted,
                lineHeight: 1,
                marginTop: '2px',
              }}>
                Administrator
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10,
                }}
                onClick={() => setShowUserMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '200px',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: colors.shadow,
                zIndex: 20,
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                  }}>
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                  }}>
                    {user?.email}
                  </div>
                </div>
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: colors.textMuted,
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = currentTheme === 'light' ? '#fef2f2' : '#7f1d1d20';
                      (e.target as HTMLButtonElement).style.color = colors.error;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLButtonElement).style.color = colors.textMuted;
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </header>
  );
} 