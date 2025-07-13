"use client";

import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null; // API returns this as string due to JSON serialization
  profile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    screenName?: string | null;
    industry?: string | null;
    userId: number;
    role: 'admin' | 'customer' | 'user';
  } | null;
}

interface DashboardWithPaginationProps {
  initialUsers: User[];
  initialTotalPages: number;
}

export default function DashboardWithPagination({ initialUsers, initialTotalPages }: DashboardWithPaginationProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=25`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleRefresh = () => {
    fetchUsers(currentPage);
  };

  // Fetch total count on mount to set initial pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const response = await fetch('/api/admin/users?page=1&limit=25');
        if (response.ok) {
          const data = await response.json();
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching total count:', error);
      }
    };

    // Only fetch if we don't have the real total pages yet
    if (initialTotalPages === 1 && initialUsers.length > 0) {
      fetchTotalCount();
    }
  }, [initialUsers.length, initialTotalPages]);

  // Fetch users if initialUsers is empty on mount
  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && users.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Dashboard
      users={users}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      isLoading={isLoading}
    />
  );
} 