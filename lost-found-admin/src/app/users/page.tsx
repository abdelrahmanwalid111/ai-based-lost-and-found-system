"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, X, Check, Search, RefreshCw, Users, AlertTriangle, Shield } from "lucide-react";
import { IUser } from "@/models/User";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const { colors, theme } = useTheme();
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    fraudStatus: "all",
  });
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    fraudUser: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filters]);

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term (name or email)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((user) => {
        const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.toLowerCase();
        const email = (user?.email || '').toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    // Filter by role
    if (filters.role !== "all") {
      filtered = filtered.filter((user) => user?.role === filters.role);
    }

    // Filter by fraud status
    if (filters.fraudStatus !== "all") {
      filtered = filtered.filter((user) => user?.fraudUser === filters.fraudStatus);
    }

    setFilteredUsers(filtered);
  };

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/users?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Ensure all required fields exist
      const validUsers = data.map((user: any) => ({
        ...user,
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        role: user.role || 'user',
        fraudUser: user.fraudUser || 'false'
      }));
      setUsers(validUsers);
      setFilteredUsers(validUsers);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('[Users] Manual refresh triggered');
    await fetchUsers(true);
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user._id);
    setEditForm({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      role: user.role || 'user',
      fraudUser: user.fraudUser || 'false',
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUser,
          ...editForm,
        }),
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { color: '#8b5cf6', bg: theme === 'light' ? '#f3e8ff' : '#581c8720' };
      case 'user':
        return { color: '#3b82f6', bg: theme === 'light' ? '#dbeafe' : '#1e3a8a20' };
      default:
        return { color: colors.textMuted, bg: colors.surfaceHover };
    }
  };

  const getFraudColor = (fraudUser: string) => {
    if (fraudUser === 'true') {
      return { color: '#dc2626', bg: theme === 'light' ? '#fee2e2' : '#7f1d1d20' };
    }
    return { color: '#16a34a', bg: theme === 'light' ? '#dcfce7' : '#14532d20' };
  };

  const renderFilters = () => {
    return (
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: colors.shadow,
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '16px',
          margin: 0,
        }}>
          Filters
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}>
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
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
              />
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textMuted,
              }} />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}>
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
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
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Fraud Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '6px',
            }}>
              Fraud Status
            </label>
            <select
              value={filters.fraudStatus}
              onChange={(e) => setFilters({ ...filters, fraudStatus: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
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
            >
              <option value="all">All Status</option>
              <option value="false">Normal</option>
              <option value="true">Flagged</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (isLoading) {
      return (
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: colors.shadow,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto',
          }}></div>
          <p style={{
            color: colors.textMuted,
            fontSize: '14px',
            margin: 0,
          }}>
            Loading users...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: colors.shadow,
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: colors.surfaceHover,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Users size={20} style={{ color: colors.textMuted }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '8px',
            margin: 0,
          }}>
            No users found
          </h3>
          <p style={{
            color: colors.textMuted,
            fontSize: '14px',
            margin: 0,
          }}>
            {filters.search || filters.role !== 'all' || filters.fraudStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'No users available'}
          </p>
        </div>
      );
    }

    return (
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        boxShadow: colors.shadow,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                background: colors.surfaceHover,
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Name
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Email
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Role
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Created
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const roleStyle = getRoleColor(user.role || 'user');
                const fraudStyle = getFraudColor(user.fraudUser || 'false');
                
                return (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: index < filteredUsers.length - 1 ? `1px solid ${colors.border}` : 'none',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      {editingUser === user._id ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={editForm.firstname}
                            onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              fontSize: '14px',
                              background: colors.surface,
                              color: colors.textPrimary,
                            }}
                            placeholder="First name"
                          />
                          <input
                            type="text"
                            value={editForm.lastname}
                            onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              fontSize: '14px',
                              background: colors.surface,
                              color: colors.textPrimary,
                            }}
                            placeholder="Last name"
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '4px',
                          }}>
                            {user.firstname} {user.lastname}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: colors.textMuted,
                            background: colors.surfaceHover,
                            padding: '1px 4px',
                            borderRadius: '3px',
                            display: 'inline-block',
                          }}>
                            ID: {user._id.slice(-6)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            fontSize: '14px',
                            background: colors.surface,
                            color: colors.textPrimary,
                          }}
                        />
                      ) : (
                        <div style={{
                          fontSize: '14px',
                          color: colors.textPrimary,
                        }}>
                          {user.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            fontSize: '14px',
                            background: colors.surface,
                            color: colors.textPrimary,
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: roleStyle.color,
                          background: roleStyle.bg,
                          textTransform: 'capitalize',
                        }}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.fraudUser}
                          onChange={(e) => setEditForm({ ...editForm, fraudUser: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            fontSize: '14px',
                            background: colors.surface,
                            color: colors.textPrimary,
                          }}
                        >
                          <option value="false">Normal</option>
                          <option value="true">Flagged</option>
                        </select>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.fraudUser === 'true' ? (
                            <AlertTriangle size={14} style={{ color: fraudStyle.color }} />
                          ) : (
                            <Shield size={14} style={{ color: fraudStyle.color }} />
                          )}
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: fraudStyle.color,
                            background: fraudStyle.bg,
                          }}>
                            {user.fraudUser === 'true' ? 'Flagged' : 'Normal'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                      }}>
                        {formatDate(new Date(user.createdAt))}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {editingUser === user._id ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              style={{
                                padding: '6px',
                                background: colors.success,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              title="Save Changes"
                            >
                              <Check size={14} style={{ color: 'white' }} />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              style={{
                                padding: '6px',
                                background: colors.error,
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              title="Cancel"
                            >
                              <X size={14} style={{ color: 'white' }} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{
                                padding: '6px',
                                background: colors.surface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.primary + '20';
                                (e.target as HTMLButtonElement).style.borderColor = colors.primary;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                (e.target as HTMLButtonElement).style.borderColor = colors.border;
                              }}
                              title="Edit User"
                            >
                              <Pencil size={14} style={{ color: colors.primary }} />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              style={{
                                padding: '6px',
                                background: colors.surface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.error + '20';
                                (e.target as HTMLButtonElement).style.borderColor = colors.error;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                (e.target as HTMLButtonElement).style.borderColor = colors.border;
                              }}
                              title="Delete User"
                            >
                              <Trash2 size={14} style={{ color: colors.error }} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div style={{
        padding: '24px',
        minHeight: '100vh',
        background: colors.background,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '8px',
                margin: 0,
              }}>
                Users Management
              </h1>
              <p style={{
                fontSize: '16px',
                color: colors.textMuted,
                margin: 0,
              }}>
                Manage user accounts and permissions
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastFetchTime && (
                <span style={{
                  fontSize: '12px',
                  color: colors.textMuted,
                }}>
                  Last updated: {formatDate(lastFetchTime)}
                </span>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: colors.primary,
                  color: colors.primaryText,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  opacity: isLoading ? 0.6 : 1,
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
                <RefreshCw size={16} style={{
                  animation: isLoading ? 'spin 1s linear infinite' : 'none',
                }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: colors.shadow,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: colors.primary + '20',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users size={20} style={{ color: colors.primary }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                  }}>
                    {users.length}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.textMuted,
                  }}>
                    Total Users
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: colors.shadow,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: colors.success + '20',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shield size={20} style={{ color: colors.success }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                  }}>
                    {users.filter(u => u.fraudUser !== 'true').length}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.textMuted,
                  }}>
                    Normal Users
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: colors.shadow,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: colors.error + '20',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertTriangle size={20} style={{ color: colors.error }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                  }}>
                    {users.filter(u => u.fraudUser === 'true').length}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.textMuted,
                  }}>
                    Flagged Users
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Table */}
          {renderTable()}
        </div>
      </div>
    </ProtectedRoute>
  );
} 