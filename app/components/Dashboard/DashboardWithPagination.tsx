"use client";

import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Spinner from '../Spinner/Spinner';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  email?: string | null;
  image?: string | null;
  industry?: string | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DashboardWithPaginationProps {
  initialUsers: User[];
}

export default function DashboardWithPagination({ initialUsers }: DashboardWithPaginationProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch total count and set initial pagination on mount
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const response = await fetch('/api/admin/users?page=1&limit=25');
        const data = await response.json();
        
        if (data.success) {
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };

    fetchTotalCount();
  }, []);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=25`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(newPage);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => fetchUsers(currentPage)}>Retry</button>
      </div>
    );
  }

  return (
    <Dashboard 
      users={users} 
      pagination={pagination}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );
} 