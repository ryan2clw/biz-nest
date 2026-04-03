"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./BusinessList.module.scss";

export interface Business {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
}

interface BusinessListProps {
  businesses: Business[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function BusinessList({ businesses, onRefresh, isLoading }: BusinessListProps) {
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (biz: Business) => {
    setPendingDelete({ id: biz.id, name: biz.name });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/business/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPendingDelete(null);
      onRefresh();
    } catch {
      // silently fail — list will stay as-is
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={styles.businessList}>
        <div className={styles.header}>
          <h2>Businesses</h2>
          <button onClick={onRefresh} className={styles.refreshButton}>
            Refresh
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className={styles.loadingCell}>
                    <div className={styles.spinner} />
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    No businesses yet. Create one using the form.
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => (
                  <tr key={biz.id} className={styles.tableRow}>
                    <td>
                      {biz.logoUrl ? (
                        <Image
                          src={biz.logoUrl}
                          alt={`${biz.name} logo`}
                          width={40}
                          height={40}
                          className={styles.logo}
                          unoptimized
                        />
                      ) : (
                        <div className={styles.logoPlaceholder}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className={styles.nameCell}>{biz.name}</td>
                    <td className={styles.slugCell}>{biz.slug}</td>
                    <td className={styles.dateCell}>
                      {new Date(biz.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.actionsCell}>
                      <Link
                        href={`/admin/page-editor/${biz.id}`}
                        className={styles.editPageBtn}
                      >
                        Edit Page
                      </Link>
                      <Link
                        href={`/admin/leads/${biz.id}`}
                        className={styles.leadsBtn}
                      >
                        Leads
                      </Link>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(biz)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pendingDelete && (
        <div className={styles.modalOverlay} onClick={() => setPendingDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete Business</h3>
            <p className={styles.modalBody}>
              Are you sure you want to delete <strong>{pendingDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
