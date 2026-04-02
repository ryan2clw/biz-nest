"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Hero from "../../components/Hero/Hero";
import styles from "./PageEditorPage.module.scss";

interface HeroPageContent {
  contentType: "hero";
  carouselItems: [string, string, string];
  ctaText: string;
  ctaUrl: string;
  heroImageUrl?: string;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  content: HeroPageContent | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface PageEditorPageProps {
  business: Business;
  page: PageData | null;
}

const DEFAULT_CONTENT: HeroPageContent = {
  contentType: "hero",
  carouselItems: ["", "", ""],
  ctaText: "Get Started",
  ctaUrl: "",
};

export default function PageEditorPage({ business, page }: PageEditorPageProps) {
  const existingContent = page?.content ?? DEFAULT_CONTENT;

  const [slide1, setSlide1] = useState(existingContent.carouselItems[0]);
  const [slide2, setSlide2] = useState(existingContent.carouselItems[1]);
  const [slide3, setSlide3] = useState(existingContent.carouselItems[2]);
  const [ctaText, setCtaText] = useState(existingContent.ctaText);
  const [ctaUrl, setCtaUrl] = useState(existingContent.ctaUrl);
  const [heroImageUrl, setHeroImageUrl] = useState(existingContent.heroImageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(existingContent.heroImageUrl ?? "");
  const [published, setPublished] = useState(page?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carouselItems: [string, string, string] = [
    slide1 || "Slide 1 text...",
    slide2 || "Slide 2 text...",
    slide3 || "Slide 3 text...",
  ];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", business.id);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setHeroImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setImagePreview(heroImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const content: HeroPageContent = {
      contentType: "hero",
      carouselItems: [slide1, slide2, slide3],
      ctaText,
      ctaUrl,
      heroImageUrl: heroImageUrl || undefined,
    };

    try {
      let res;
      if (page) {
        res = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, published }),
        });
      } else {
        res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: business.id,
            title: `${business.name} Home`,
            slug: business.slug,
            content,
            published,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      {/* LEFT — Editor form */}
      <div className={styles.editorPanel}>
        <div className={styles.outerContainer}>
          <h2 className={styles.heading}>Page Editor</h2>
          <div className={styles.innerContainer}>

            <div className={styles.businessBadge}>{business.name}</div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Carousel Slides</h3>
              {[
                { label: "Slide 1", value: slide1, set: setSlide1 },
                { label: "Slide 2", value: slide2, set: setSlide2 },
                { label: "Slide 3", value: slide3, set: setSlide3 },
              ].map(({ label, value, set }) => (
                <div className={styles.formGroup} key={label}>
                  <label className={styles.label}>{label}</label>
                  <textarea
                    className={styles.textarea}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    rows={2}
                    placeholder={`${label} text...`}
                  />
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Call to Action</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Button Text</label>
                <input
                  className={styles.input}
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Button URL</label>
                <input
                  className={styles.input}
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Hero Image</h3>
              <div
                className={`${styles.uploadArea} ${imagePreview ? styles.hasPreview : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Hero preview"
                    className={styles.imagePreview}
                    width={400}
                    height={160}
                    unoptimized
                  />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>{uploading ? "Uploading..." : "Click to upload hero image"}</span>
                    <span className={styles.uploadHint}>PNG, JPG — max 5MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
              {imagePreview && (
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => { setImagePreview(""); setHeroImageUrl(""); }}
                >
                  Remove image
                </button>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.publishRow}>
                <span className={styles.label}>Published</span>
                <button
                  type="button"
                  className={`${styles.toggleSwitch} ${published ? styles.toggled : ""}`}
                  onClick={() => setPublished((p) => !p)}
                  aria-label="Toggle published"
                >
                  <span className={styles.toggleSlider} />
                </button>
                <span className={styles.publishStatus}>{published ? "Live" : "Draft"}</span>
              </div>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>Page saved!</div>}

            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : page ? "Save Changes" : "Create Page"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — Live preview */}
      <div className={styles.previewPanel}>
        <div className={styles.outerContainer}>
          <h2 className={styles.heading}>Live Preview</h2>
          <div className={styles.innerContainer}>
            <Hero
              carouselItems={carouselItems}
              ctaText={ctaText || "Get Started"}
              ctaUrl={ctaUrl || undefined}
              heroImageUrl={imagePreview || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
