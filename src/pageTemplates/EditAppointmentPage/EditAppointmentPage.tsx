"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./EditAppointmentPage.module.scss";

interface Business {
  id: string;
  name: string;
}

interface Technician {
  id: string;
  businessId: string;
  name: string;
  phone: string | null;
  email: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
}

interface Appointment {
  id: string;
  businessId: string;
  technicianId: string | null;
  leadId: string | null;
  title: string;
  customerName: string;
  location: string | null;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  technician: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  lead: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

interface EditAppointmentPageProps {
  business: Business;
  technicians: Technician[];
  leads: Lead[];
  appointment: Appointment;
}

function getDateTimeInputValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDurationHours(start: string, end: string) {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  return `${durationHours.toFixed(durationHours % 1 === 0 ? 0 : 1)}h`;
}

export default function EditAppointmentPage({
  business,
  technicians,
  leads,
  appointment,
}: EditAppointmentPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: appointment.title,
    customerName: appointment.customerName,
    location: appointment.location ?? "",
    leadId: appointment.leadId ?? "",
    technicianId: appointment.technicianId ?? "",
    scheduledStart: getDateTimeInputValue(appointment.scheduledStart),
    scheduledEnd: getDateTimeInputValue(appointment.scheduledEnd),
    status: appointment.status,
    notes: appointment.notes ?? "",
  });

  const linkedLead = useMemo(
    () => leads.find((lead) => lead.id === form.leadId) ?? null,
    [form.leadId, leads]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to update appointment");
      return;
    }

    setFeedback("Appointment updated.");
    startTransition(() => router.refresh());
  }

  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Appointment Editor</p>
            <h1 className={styles.heading}>{appointment.title}</h1>
            <p className={styles.subheading}>
              Update scheduling, assignment, and customer details without leaving the admin flow.
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.businessBadge}>{business.name}</span>
            <Link className={styles.secondaryLink} href={`/admin/calendar/${business.id}`}>
              Back to calendar
            </Link>
            <Link className={styles.secondaryLink} href={`/admin/scheduler/${business.id}`}>
              Back to scheduler
            </Link>
          </div>
        </header>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Scheduled window</span>
            <strong>{formatDateTime(appointment.scheduledStart)}</strong>
            <p>{formatDateTime(appointment.scheduledEnd)}</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Duration</span>
            <strong>{getDurationHours(appointment.scheduledStart, appointment.scheduledEnd)}</strong>
            <p>{appointment.status.replace("_", " ")}</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Assigned tech</span>
            <strong>{appointment.technician?.name ?? "Unassigned"}</strong>
            <p>{appointment.location || "No service address yet"}</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Linked lead</span>
            <strong>{appointment.lead?.name ?? "No linked lead"}</strong>
            <p>{appointment.customerName}</p>
          </article>
        </section>

        {(feedback || error) && (
          <div className={error ? styles.errorBanner : styles.successBanner}>
            {error || feedback}
          </div>
        )}

        <div className={styles.contentGrid}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <h2>Edit appointment</h2>
              <span>ID: {appointment.id}</span>
            </div>

            <input
              className={styles.input}
              placeholder="Job title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />

            <input
              className={styles.input}
              placeholder="Customer name"
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              required
            />

            <input
              className={styles.input}
              placeholder="Service address"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />

            <div className={styles.gridRow}>
              <select
                className={styles.input}
                value={form.technicianId}
                onChange={(event) => setForm((current) => ({ ...current, technicianId: event.target.value }))}
              >
                <option value="">Unassigned</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>

              <select
                className={styles.input}
                value={form.leadId}
                onChange={(event) => {
                  const selectedLead = leads.find((lead) => lead.id === event.target.value);
                  setForm((current) => ({
                    ...current,
                    leadId: event.target.value,
                    customerName: selectedLead?.name || current.customerName,
                  }));
                }}
              >
                <option value="">No linked lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.status})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.gridRow}>
              <input
                className={styles.input}
                type="datetime-local"
                value={form.scheduledStart}
                onChange={(event) => setForm((current) => ({ ...current, scheduledStart: event.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="datetime-local"
                value={form.scheduledEnd}
                onChange={(event) => setForm((current) => ({ ...current, scheduledEnd: event.target.value }))}
                required
              />
            </div>

            <select
              className={styles.input}
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>

            <textarea
              className={styles.textarea}
              placeholder="Dispatch notes"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
            />

            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save appointment"}
            </button>
          </form>

          <aside className={styles.sidePanel}>
            <section className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h2>Customer snapshot</h2>
                <span>Live reference</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Customer</span>
                <strong>{form.customerName}</strong>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Lead</span>
                <strong>{linkedLead?.name ?? "No linked lead"}</strong>
                <p>{linkedLead?.email || linkedLead?.phone || "No lead contact information"}</p>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>Technician</span>
                <strong>
                  {technicians.find((technician) => technician.id === form.technicianId)?.name ?? "Unassigned"}
                </strong>
              </div>
            </section>

            <section className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h2>Navigation</h2>
                <span>Quick jumps</span>
              </div>
              <div className={styles.linkStack}>
                <Link className={styles.navLink} href={`/admin/calendar/${business.id}`}>
                  Open day calendar
                </Link>
                <Link className={styles.navLink} href={`/admin/scheduler/${business.id}`}>
                  Open scheduler board
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
