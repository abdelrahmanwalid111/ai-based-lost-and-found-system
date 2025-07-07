"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setShowUserMenu(false);
    try {
      await signOut();
    } catch (error) {
      console.error('[Navigation] Sign out error:', error);
      setIsSigningOut(false);
      alert('Sign out failed. Please try again.');
    }
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px',
          }}>
            {/* Logo */}
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700',
                }}>
                  L
                </span>
              </div>
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0,
                }}>
                  LostLink
                </h1>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '-2px',
                }}>
                  Admin Portal
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="hidden md:flex">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
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
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      color: isActive ? '#3b82f6' : '#6b7280',
                      background: isActive ? '#eff6ff' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                        (e.target as HTMLElement).style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.color = '#6b7280';
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                  (e.target as HTMLButtonElement).style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb';
                  (e.target as HTMLButtonElement).style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={16} style={{ color: 'white' }} />
                </div>
                <div style={{ textAlign: 'left' }} className="hidden lg:block">
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                  }}>
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    Administrator
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '280px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                  }}>
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: '#3b82f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <User size={20} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827',
                          }}>
                            {user?.firstname} {user?.lastname}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280',
                          }}>
                            {user?.email}
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginTop: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: '#eff6ff',
                            color: '#3b82f6',
                          }}>
                            Administrator
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#dc2626',
                          cursor: isSigningOut ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s ease',
                          opacity: isSigningOut ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSigningOut) {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#fef2f2';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSigningOut) {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <LogOut size={16} />
                        <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                  <div 
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 40,
                    }}
                    onClick={() => setShowUserMenu(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div style={{
          borderTop: '1px solid #f3f4f6',
        }}
        className="md:hidden">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            padding: '8px',
          }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    color: isActive ? '#3b82f6' : '#6b7280',
                    background: isActive ? '#eff6ff' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                      (e.target as HTMLElement).style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLElement).style.color = '#6b7280';
                    }
                  }}
                >
                  <Icon size={20} style={{ marginBottom: '4px' }} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Page Offset for Fixed Navigation */}
      <div style={{ height: '64px' }} />
    </>
  );
};

export default Navigation; 