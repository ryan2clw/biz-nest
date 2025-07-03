"use client";
import AdminPage from '../../src/pageTemplates/AdminPage/AdminPage';
import withAuth from '../../src/components/withAuth';

export default withAuth(AdminPage, 'admin'); 