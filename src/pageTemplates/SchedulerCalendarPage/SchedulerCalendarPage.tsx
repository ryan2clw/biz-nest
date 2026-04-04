"use client";

import { useMemo, useState } from "react";
import BusinessSwitcher from "../../components/BusinessSwitcher/BusinessSwitcher";
import styles from "./SchedulerCalendarPage.module.scss";

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
  scheduledFor: string;
  durationMinutes: number;
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

interface SchedulerCalendarPageProps {
  business: Business;
  allBusinesses: Business[];
  technicians: Technician[];
  leads: Lead[];
  appointments: Appointment[];
}

interface CalendarEvent extends Appointment {
  top: number;
  height: number;
  left: string;
  width: string;
}

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 88;

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelveHour} ${suffix}`;
}

function isSameCalendarDay(value: string, selectedDate: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return getDateInputValue(date) === selectedDate;
}

function getMinutesFromStart(value: string) {
  const date = new Date(value);
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes();
}

function getEventStyle(appointment: Appointment, columnIndex: number, columnCount: number): CalendarEvent {
  const minutesFromStart = getMinutesFromStart(appointment.scheduledFor);
  const duration = Math.max(appointment.durationMinutes, 30);
  const top = Math.max(0, (minutesFromStart / 60) * HOUR_HEIGHT);
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 64);
  const inset = 6;
  const width = `calc(${100 / columnCount}% - ${inset}px)`;
  const left = `calc(${(100 / columnCount) * columnIndex}% + ${inset / 2}px)`;

  return {
    ...appointment,
    top,
    height,
    left,
    width,
  };
}

function layoutLaneAppointments(appointments: Appointment[]) {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );

  const laidOut: CalendarEvent[] = [];
  let currentCluster: Appointment[] = [];
  let active: { appointment: Appointment; end: number }[] = [];

  function flushCluster(cluster: Appointment[]) {
    if (cluster.length === 0) return;

    const columnAssignments = new Map<string, number>();
    const groupedActive: { id: string; end: number; column: number }[] = [];
    let maxColumns = 1;

    for (const appointment of cluster) {
      const start = getMinutesFromStart(appointment.scheduledFor);
      const end = start + Math.max(appointment.durationMinutes, 30);

      for (let index = groupedActive.length - 1; index >= 0; index -= 1) {
        if (groupedActive[index].end <= start) {
          groupedActive.splice(index, 1);
        }
      }

      let column = 0;
      while (groupedActive.some((item) => item.column === column)) {
        column += 1;
      }

      groupedActive.push({ id: appointment.id, end, column });
      columnAssignments.set(appointment.id, column);
      maxColumns = Math.max(maxColumns, groupedActive.length);
    }

    for (const appointment of cluster) {
      laidOut.push(getEventStyle(appointment, columnAssignments.get(appointment.id) ?? 0, maxColumns));
    }
  }

  for (const appointment of sorted) {
    const start = getMinutesFromStart(appointment.scheduledFor);
    const end = start + Math.max(appointment.durationMinutes, 30);

    active = active.filter((item) => item.end > start);

    if (active.length === 0 && currentCluster.length > 0) {
      flushCluster(currentCluster);
      currentCluster = [];
    }

    currentCluster.push(appointment);
    active.push({ appointment, end });
  }

  flushCluster(currentCluster);

  return laidOut;
}

export default function SchedulerCalendarPage({
  business,
  allBusinesses,
  technicians,
  leads,
  appointments,
}: SchedulerCalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState(getDateInputValue(new Date()));

  const selectedDayAppointments = useMemo(
    () => appointments.filter((appointment) => isSameCalendarDay(appointment.scheduledFor, selectedDate)),
    [appointments, selectedDate]
  );

  const unassignedAppointments = useMemo(
    () => selectedDayAppointments.filter((appointment) => !appointment.technicianId),
    [selectedDayAppointments]
  );

  const totalHours = END_HOUR - START_HOUR;
  const timelineHeight = totalHours * HOUR_HEIGHT;
  const hours = Array.from({ length: totalHours + 1 }, (_, index) => START_HOUR + index);

  const lanes = useMemo(() => {
    const technicianLanes = technicians.map((technician) => ({
      id: technician.id,
      title: technician.name,
      subtitle: technician.phone || technician.email || "Ready for dispatch",
      color: technician.color || "#2563eb",
      events: layoutLaneAppointments(
        selectedDayAppointments.filter((appointment) => appointment.technicianId === technician.id)
      ),
    }));

    return [
      {
        id: "unassigned",
        title: "Unassigned",
        subtitle: `${unassignedAppointments.length} jobs waiting for dispatch`,
        color: "#64748b",
        events: layoutLaneAppointments(unassignedAppointments),
      },
      ...technicianLanes,
    ];
  }, [selectedDayAppointments, technicians, unassignedAppointments]);

  const appointmentsToday = appointments.filter((appointment) =>
    isSameCalendarDay(appointment.scheduledFor, getDateInputValue(new Date()))
  ).length;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <p className={styles.sidebarEyebrow}>Dispatch Hub</p>
            <h1 className={styles.sidebarTitle}>Technician Calendar</h1>
            <p className={styles.sidebarText}>
              Outlook-style day planning for crews, installs, and service calls.
            </p>
          </div>

          <div className={styles.sidebarCard}>
            <span className={styles.cardLabel}>Team</span>
            <div className={styles.teamList}>
              {technicians.length === 0 ? (
                <p className={styles.emptyMessage}>No technicians added yet.</p>
              ) : (
                technicians.map((technician) => {
                  const jobCount = selectedDayAppointments.filter(
                    (appointment) => appointment.technicianId === technician.id
                  ).length;

                  return (
                    <div key={technician.id} className={styles.teamItem}>
                      <span
                        className={styles.teamDot}
                        style={{ backgroundColor: technician.color || "#2563eb" }}
                      />
                      <div>
                        <strong>{technician.name}</strong>
                        <p>{jobCount} jobs on selected day</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <span className={styles.cardLabel}>Snapshot</span>
            <div className={styles.statGrid}>
              <div className={styles.statItem}>
                <strong>{technicians.length}</strong>
                <span>Active techs</span>
              </div>
              <div className={styles.statItem}>
                <strong>{appointmentsToday}</strong>
                <span>Today</span>
              </div>
              <div className={styles.statItem}>
                <strong>{unassignedAppointments.length}</strong>
                <span>Unassigned</span>
              </div>
              <div className={styles.statItem}>
                <strong>{leads.length}</strong>
                <span>Lead pool</span>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.topEyebrow}>Calendar View</p>
              <h2 className={styles.topTitle}>{formatLongDate(selectedDate)}</h2>
            </div>

            <div className={styles.topControls}>
              {allBusinesses.length > 1 ? (
                <BusinessSwitcher
                  businesses={allBusinesses}
                  currentBusinessId={business.id}
                  basePath="/admin/calendar"
                />
              ) : (
                <span className={styles.businessBadge}>{business.name}</span>
              )}

              <div className={styles.viewToggle}>
                <button type="button" className={`${styles.toggleButton} ${styles.activeToggle}`}>
                  Day
                </button>
                <button type="button" className={styles.toggleButton}>
                  Week
                </button>
              </div>

              <input
                className={styles.dateInput}
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.legendRow}>
            <span>Travel-aware layout target</span>
            <span>Duration-based appointment blocks</span>
            <span>Lead-linked jobs</span>
            <span>Conflict-ready columns</span>
          </div>

          <section className={styles.calendarFrame}>
            <div className={styles.calendarHeader}>
              <div className={styles.timeHeader}>Time</div>
              <div className={styles.lanesHeader}>
                {lanes.map((lane) => (
                  <div key={lane.id} className={styles.laneHeaderCard}>
                    <div className={styles.laneHeaderTitle}>
                      <span className={styles.laneHeaderDot} style={{ backgroundColor: lane.color }} />
                      <strong>{lane.title}</strong>
                    </div>
                    <p>{lane.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.calendarBody}>
              <div className={styles.timeColumn}>
                {hours.slice(0, -1).map((hour) => (
                  <div key={hour} className={styles.timeSlot} style={{ height: `${HOUR_HEIGHT}px` }}>
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              <div className={styles.laneColumns}>
                {lanes.map((lane) => (
                  <div key={lane.id} className={styles.laneColumn} style={{ height: `${timelineHeight}px` }}>
                    {hours.map((hour, index) =>
                      index === hours.length - 1 ? null : (
                        <div
                          key={hour}
                          className={styles.hourLine}
                          style={{ top: `${index * HOUR_HEIGHT}px` }}
                        />
                      )
                    )}

                    {lane.events.length === 0 ? (
                      <div className={styles.emptyLane}>Nothing scheduled in this lane.</div>
                    ) : null}

                    {lane.events.map((appointment) => (
                      <article
                        key={appointment.id}
                        className={`${styles.eventCard} ${styles[appointment.status] ?? ""}`}
                        style={{
                          top: `${appointment.top}px`,
                          height: `${appointment.height}px`,
                          left: appointment.left,
                          width: appointment.width,
                          borderLeftColor: appointment.technician?.color || lane.color,
                        }}
                      >
                        <div className={styles.eventTime}>
                          {formatTime(appointment.scheduledFor)} - {appointment.durationMinutes} min
                        </div>
                        <h3>{appointment.title}</h3>
                        <p className={styles.eventCustomer}>{appointment.customerName}</p>
                        {appointment.location ? <p>{appointment.location}</p> : null}
                        {appointment.lead ? <p>Lead: {appointment.lead.name}</p> : null}
                        {appointment.notes ? <p>{appointment.notes}</p> : null}
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
