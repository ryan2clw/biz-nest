"use client";

import { useState, useRef } from "react";
import styles from "./CreateBusinessPage.module.scss";
import BusinessList, { Business } from "../../components/BusinessList/BusinessList";

interface CreateBusinessPageProps {
  initialBusinesses: Business[];
}

export default function CreateBusinessPage({ initialBusinesses }: CreateBusinessPageProps) {
  const [name, setName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [listLoading, setListLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBusinesses = async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/admin/business");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses);
      }
    } catch {
      // silently fail — list will just stay stale
    } finally {
      setListLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl: logoPreview }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business");

      setSuccess(true);
      setName("");
      setLogoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchBusinesses();

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.outerContainer}>
        <h1 className={styles.heading}>Create Business</h1>
        <div className={styles.innerContainer}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="businessName">
                Business Name
              </label>
              <input
                id="businessName"
                className={styles.input}
                type="text"
                placeholder="e.g. Acme Plumbing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Logo</label>
              <div
                className={`${styles.uploadArea} ${logoPreview ? styles.hasPreview : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className={styles.logoPreview} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Click to upload logo</span>
                    <span className={styles.uploadHint}>PNG, JPG, SVG — max 2MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className={styles.hiddenInput}
              />
              {logoPreview && (
                <button
                  type="button"
                  className={styles.removeLogoBtn}
                  onClick={handleRemoveLogo}
                >
                  Remove logo
                </button>
              )}
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>Business created!</div>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !name.trim()}
            >
              {loading ? "Creating..." : "Create Business"}
            </button>
          </form>
        </div>
      </div>

      <BusinessList
        businesses={businesses}
        onRefresh={fetchBusinesses}
        isLoading={listLoading}
      />
    </div>
  );
}
