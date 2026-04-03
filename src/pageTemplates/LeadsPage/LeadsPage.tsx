import styles from "./LeadsPage.module.scss";
import LeadsTable from "../../components/LeadsTable/LeadsTable";
import BusinessSwitcher from "../../components/BusinessSwitcher/BusinessSwitcher";

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

interface Business {
  id: string;
  name: string;
}

interface LeadsPageProps {
  business: Business;
  allBusinesses: Business[];
  leads: Lead[];
}

export default function LeadsPage({ business, allBusinesses, leads }: LeadsPageProps) {
  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.heading}>Leads</h1>
            {allBusinesses.length > 1 ? (
              <BusinessSwitcher
                businesses={allBusinesses}
                currentBusinessId={business.id}
                basePath="/admin/leads"
              />
            ) : (
              <span className={styles.businessBadge}>{business.name}</span>
            )}
          </div>
          <span className={styles.count}>{leads.length} total</span>
        </div>
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}
