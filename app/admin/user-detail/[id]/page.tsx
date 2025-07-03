"use client";
import UserDetailPage from '../../../../src/pageTemplates/UserDetailPage/UserDetailPage';
import withAuth from '../../../../src/components/withAuth';

export default withAuth(UserDetailPage, 'admin'); 