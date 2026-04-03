"use client";

import { useState } from "react";
import styles from "./LeadsTable.module.scss";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  source: string | null;
  pagePath: string | null;
  createdAt: Date;
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={styles.desktopOnly}>Email</th>
              <th>Phone</th>
              <th className={styles.desktopOnly}>Message</th>
              <th className={styles.desktopOnly}>Status</th>
              <th className={styles.desktopOnly}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className={styles.tableRow}>
                  <td className={styles.nameCell}>
                    <button className={styles.nameButton} onClick={() => setSelected(lead)}>
                      {lead.name}
                    </button>
                  </td>
                  <td className={styles.desktopOnly}>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className={styles.emailLink}>{lead.email}</a>
                    ) : (
                      <span className={styles.empty}>—</span>
                    )}
                  </td>
                  <td className={styles.phoneCell}>
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className={styles.phoneLink}>{lead.phone}</a>
                    ) : (
                      <span className={styles.empty}>—</span>
                    )}
                  </td>
                  <td className={`${styles.messageCell} ${styles.desktopOnly}`}>
                    {lead.message ?? <span className={styles.empty}>—</span>}
                  </td>
                  <td className={styles.desktopOnly}>
                    <span className={`${styles.statusBadge} ${styles[lead.status] ?? ""}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className={`${styles.dateCell} ${styles.desktopOnly}`}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalName}>{selected.name}</h3>
              <button className={styles.closeBtn} onClick={() => setSelected(null)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {selected.email && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Email</span>
                  <a href={`mailto:${selected.email}`} className={styles.emailLink}>{selected.email}</a>
                </div>
              )}
              {selected.phone && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Phone</span>
                  <a href={`tel:${selected.phone}`} className={styles.phoneLink}>{selected.phone}</a>
                </div>
              )}
              {selected.message && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Message</span>
                  <p className={styles.modalMessage}>{selected.message}</p>
                </div>
              )}
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Status</span>
                <span className={`${styles.statusBadge} ${styles[selected.status] ?? ""}`}>
                  {selected.status}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Date</span>
                <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
