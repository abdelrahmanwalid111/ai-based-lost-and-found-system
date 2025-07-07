'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const { isAdmin, signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    {
      name: 'Fraud Detection',
      href: '/fraud',
      icon: AlertTriangle,
      current: pathname.startsWith('/fraud'),
      adminOnly: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: pathname.startsWith('/settings'),
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '8px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
        }}
        className="sm:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu size={20} style={{ color: '#374151' }} />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
          className="sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isMobileMenuOpen ? 0 : '-288px',
          width: '288px',
          height: '100vh',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 50,
          transition: 'left 0.3s ease',
        }}
        className="sm:left-0"
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
            }}>
              LostLink
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0',
            }}>
              Admin Dashboard
            </p>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              padding: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            className="sm:hidden"
          >
            <X size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name} style={{ marginBottom: '4px' }}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      background: isActive ? '#f3f4f6' : 'transparent',
                      color: isActive ? '#111827' : '#6b7280',
                      fontWeight: isActive ? '500' : '400',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.target as HTMLElement).style.background = '#f9fafb';
                        (e.target as HTMLElement).style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.target as HTMLElement).style.background = 'transparent';
                        (e.target as HTMLElement).style.color = '#6b7280';
                      }
                    }}
                  >
                    <Icon size={20} style={{ marginRight: '12px' }} />
                    <span style={{ fontSize: '14px' }}>{item.name}</span>
                    {isActive && (
                      <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#6b7280' }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #f3f4f6',
          background: '#f9fafb',
        }}>
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
            }}>
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 