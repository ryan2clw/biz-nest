"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SchedulerPage.module.scss";
import BusinessSwitcher from "../../components/BusinessSwitcher/BusinessSwitcher";

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

interface SchedulerPageProps {
  business: Business;
  allBusinesses: Business[];
  technicians: Technician[];
  leads: Lead[];
  appointments: Appointment[];
}

const TECHNICIAN_COLORS = ["#0f766e", "#1d4ed8", "#b45309", "#7c3aed", "#be123c", "#166534"];

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isSameCalendarDay(value: string, selectedDate: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return getDateInputValue(date) === selectedDate;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export default function SchedulerPage({
  business,
  allBusinesses,
  technicians,
  leads,
  appointments,
}: SchedulerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(getDateInputValue(new Date()));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [technicianForm, setTechnicianForm] = useState({
    name: "",
    phone: "",
    email: "",
    color: TECHNICIAN_COLORS[0],
  });

  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    customerName: "",
    location: "",
    leadId: "",
    technicianId: "",
    scheduledStart: getDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000)),
    scheduledEnd: getDateTimeInputValue(new Date(Date.now() + 3 * 60 * 60 * 1000)),
    status: "scheduled",
    notes: "",
  });

  useEffect(() => {
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const date = searchParams.get("date");
    const technicianId = searchParams.get("technicianId") || "";

    if (date) {
      setSelectedDate(date);
    }

    if (!start || !end) {
      return;
    }

    const resolvedTechnicianId = technicians.some((technician) => technician.id === technicianId) ? technicianId : "";

    setAppointmentForm((current) => ({
      ...current,
      technicianId: resolvedTechnicianId,
      scheduledStart: start,
      scheduledEnd: end,
    }));
  }, [searchParams, technicians]);

  const appointmentsForDay = useMemo(
    () => appointments.filter((appointment) => isSameCalendarDay(appointment.scheduledStart, selectedDate)),
    [appointments, selectedDate]
  );

  const appointmentsToday = useMemo(
    () => appointments.filter((appointment) => isSameCalendarDay(appointment.scheduledStart, getDateInputValue(new Date()))).length,
    [appointments]
  );

  const unassignedCount = appointmentsForDay.filter((appointment) => !appointment.technicianId).length;

  async function handleTechnicianSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const response = await fetch("/api/admin/technicians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        ...technicianForm,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create technician");
      return;
    }

    setTechnicianForm({
      name: "",
      phone: "",
      email: "",
      color: technicianForm.color,
    });
    setFeedback("Technician added.");
    startTransition(() => router.refresh());
  }

  async function handleAppointmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const response = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        ...appointmentForm,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create appointment");
      return;
    }

    setAppointmentForm({
      title: "",
      customerName: "",
      location: "",
      leadId: "",
      technicianId: "",
      scheduledStart: appointmentForm.scheduledStart,
      scheduledEnd: appointmentForm.scheduledEnd,
      status: "scheduled",
      notes: "",
    });
    setFeedback("Appointment scheduled.");
    startTransition(() => router.refresh());
  }

  return (
    <div className={styles.pageLayout}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>Technician Scheduler</h1>
            <p className={styles.subheading}>
              Keep each crew&apos;s day visible and turn incoming leads into bookable work.
            </p>
          </div>
          {allBusinesses.length > 1 ? (
            <BusinessSwitcher
              businesses={allBusinesses}
              currentBusinessId={business.id}
              basePath="/admin/scheduler"
            />
          ) : (
            <span className={styles.businessBadge}>{business.name}</span>
          )}
        </div>

        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Active technicians</span>
            <strong className={styles.metricValue}>{technicians.length}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Appointments today</span>
            <strong className={styles.metricValue}>{appointmentsToday}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Unassigned on selected day</span>
            <strong className={styles.metricValue}>{unassignedCount}</strong>
          </div>
        </div>

        <div className={styles.forms}>
          <form className={styles.formCard} onSubmit={handleTechnicianSubmit}>
            <div className={styles.cardHeader}>
              <h2>Add Technician</h2>
              <span>{technicians.length} on roster</span>
            </div>
            <input
              className={styles.input}
              placeholder="Technician name"
              value={technicianForm.name}
              onChange={(event) => setTechnicianForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <input
              className={styles.input}
              placeholder="Phone"
              value={technicianForm.phone}
              onChange={(event) => setTechnicianForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <input
              className={styles.input}
              placeholder="Email"
              type="email"
              value={technicianForm.email}
              onChange={(event) => setTechnicianForm((current) => ({ ...current, email: event.target.value }))}
            />
            <select
              className={styles.input}
              value={technicianForm.color}
              onChange={(event) => setTechnicianForm((current) => ({ ...current, color: event.target.value }))}
            >
              {TECHNICIAN_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create technician"}
            </button>
          </form>

          <form className={styles.formCard} onSubmit={handleAppointmentSubmit}>
            <div className={styles.cardHeader}>
              <h2>Book Appointment</h2>
              <span>{appointments.length} total scheduled</span>
            </div>
            <input
              className={styles.input}
              placeholder="Job title"
              value={appointmentForm.title}
              onChange={(event) => setAppointmentForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
            <input
              className={styles.input}
              placeholder="Customer name"
              value={appointmentForm.customerName}
              onChange={(event) => setAppointmentForm((current) => ({ ...current, customerName: event.target.value }))}
              required
            />
            <input
              className={styles.input}
              placeholder="Service address"
              value={appointmentForm.location}
              onChange={(event) => setAppointmentForm((current) => ({ ...current, location: event.target.value }))}
            />
            <div className={styles.gridRow}>
              <select
                className={styles.input}
                value={appointmentForm.technicianId}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, technicianId: event.target.value }))}
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
                value={appointmentForm.leadId}
                onChange={(event) => {
                  const selectedLead = leads.find((lead) => lead.id === event.target.value);
                  setAppointmentForm((current) => ({
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
                value={appointmentForm.scheduledStart}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, scheduledStart: event.target.value }))}
                required
              />
              <input
                className={styles.input}
                type="datetime-local"
                value={appointmentForm.scheduledEnd}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, scheduledEnd: event.target.value }))}
                required
              />
            </div>
            <div className={styles.gridRow}>
              <select
                className={styles.input}
                value={appointmentForm.status}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
              <div className={styles.spacer}></div>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Dispatch notes"
              value={appointmentForm.notes}
              onChange={(event) => setAppointmentForm((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
            />
            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Schedule appointment"}
            </button>
          </form>
        </div>

        {(feedback || error) && (
          <div className={error ? styles.errorBanner : styles.successBanner}>
            {error || feedback}
          </div>
        )}

        <div className={styles.scheduleHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Daily Board</h2>
            <p className={styles.sectionHint}>Choose a date to see assigned work by technician.</p>
          </div>
          <input
            className={styles.dateInput}
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

        <div className={styles.board}>
          <section className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>Unassigned</h3>
              <span>{appointmentsForDay.filter((appointment) => !appointment.technicianId).length}</span>
            </div>
            <div className={styles.columnBody}>
              {appointmentsForDay.filter((appointment) => !appointment.technicianId).length === 0 ? (
                <p className={styles.emptyState}>No unassigned appointments for this day.</p>
              ) : (
                appointmentsForDay
                  .filter((appointment) => !appointment.technicianId)
                  .map((appointment) => (
                    <article key={appointment.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <strong>{appointment.title}</strong>
                        <span className={`${styles.statusBadge} ${styles[appointment.status] ?? ""}`}>
                          {appointment.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className={styles.cardMeta}>{formatTimeRange(appointment.scheduledStart, appointment.scheduledEnd)}</p>
                      <p className={styles.cardMeta}>{appointment.customerName}</p>
                      {appointment.location && <p className={styles.cardMeta}>{appointment.location}</p>}
                      {appointment.notes && <p className={styles.cardNotes}>{appointment.notes}</p>}
                    </article>
                  ))
              )}
            </div>
          </section>

          {technicians.map((technician) => {
            const technicianAppointments = appointmentsForDay.filter(
              (appointment) => appointment.technicianId === technician.id
            );

            return (
              <section key={technician.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <div className={styles.techHeading}>
                    <span
                      className={styles.techDot}
                      style={{ backgroundColor: technician.color || "#1d4ed8" }}
                    />
                    <h3>{technician.name}</h3>
                  </div>
                  <span>{technicianAppointments.length}</span>
                </div>
                <div className={styles.columnBody}>
                  {technicianAppointments.length === 0 ? (
                    <p className={styles.emptyState}>No appointments assigned.</p>
                  ) : (
                    technicianAppointments.map((appointment) => (
                      <article key={appointment.id} className={styles.card}>
                        <div className={styles.cardTop}>
                          <strong>{appointment.title}</strong>
                          <span className={`${styles.statusBadge} ${styles[appointment.status] ?? ""}`}>
                            {appointment.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className={styles.cardMeta}>{formatTimeRange(appointment.scheduledStart, appointment.scheduledEnd)}</p>
                        <p className={styles.cardMeta}>{appointment.customerName}</p>
                        {appointment.location && <p className={styles.cardMeta}>{appointment.location}</p>}
                        {appointment.lead && (
                          <p className={styles.cardMeta}>Lead: {appointment.lead.name}</p>
                        )}
                        {appointment.notes && <p className={styles.cardNotes}>{appointment.notes}</p>}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
