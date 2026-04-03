"use client";

import { useRouter } from "next/navigation";
import styles from "./BusinessSwitcher.module.scss";

interface Business {
  id: string;
  name: string;
}

interface BusinessSwitcherProps {
  businesses: Business[];
  currentBusinessId: string;
  basePath: string;
}

export default function BusinessSwitcher({ businesses, currentBusinessId, basePath }: BusinessSwitcherProps) {
  const router = useRouter();

  return (
    <select
      className={styles.select}
      value={currentBusinessId}
      onChange={(e) => router.push(`${basePath}/${e.target.value}`)}
    >
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
