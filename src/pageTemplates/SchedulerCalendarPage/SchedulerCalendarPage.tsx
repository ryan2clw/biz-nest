"use client";

import { UIEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BusinessSwitcher from "../../components/BusinessSwitcher/BusinessSwitcher";
import styles from "./SchedulerCalendarPage.module.scss";

type View = "day" | "week";

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

interface Lane {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  events: CalendarEvent[];
  isToday?: boolean;
}

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 88;
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2;

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

function formatLongDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getWeekDays(dateStr: string): string[] {
  const date = new Date(`${dateStr}T12:00:00`);
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    return getDateInputValue(current);
  });
}

function formatWeekDayHeader(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return {
    weekday: date.toLocaleDateString([], { weekday: "short" }),
    date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
  };
}

function formatWeekRange(dateStr: string) {
  const days = getWeekDays(dateStr);
  const start = new Date(`${days[0]}T12:00:00`);
  const end = new Date(`${days[6]}T12:00:00`);

  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString([], { month: "long", day: "numeric" })} - ${end.getDate()}`;
  }

  return `${start.toLocaleDateString([], { month: "short", day: "numeric" })} - ${end.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDurationMinutes(start: string, end: string) {
  return Math.max(30, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelveHour} ${suffix}`;
}

function formatSlotLabel(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
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
  const minutesFromStart = getMinutesFromStart(appointment.scheduledStart);
  const duration = getDurationMinutes(appointment.scheduledStart, appointment.scheduledEnd);
  const top = Math.max(0, (minutesFromStart / 60) * HOUR_HEIGHT);
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 64);
  const inset = 6;

  return {
    ...appointment,
    top,
    height,
    width: `calc(${100 / columnCount}% - ${inset}px)`,
    left: `calc(${(100 / columnCount) * columnIndex}% + ${inset / 2}px)`,
  };
}

function intersectsWindow(appointment: Appointment, startDate: Date, endDate: Date) {
  const appointmentStart = new Date(appointment.scheduledStart).getTime();
  const appointmentEnd = new Date(appointment.scheduledEnd).getTime();
  return appointmentStart < endDate.getTime() && appointmentEnd > startDate.getTime();
}

function layoutLaneAppointments(appointments: Appointment[]) {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  );

  const laidOut: CalendarEvent[] = [];
  let currentCluster: Appointment[] = [];
  let active: { end: number }[] = [];

  function flushCluster(cluster: Appointment[]) {
    if (cluster.length === 0) return;

    const columnAssignments = new Map<string, number>();
    const groupedActive: { end: number; column: number }[] = [];
    let maxColumns = 1;

    for (const appointment of cluster) {
      const start = getMinutesFromStart(appointment.scheduledStart);
      const end = start + getDurationMinutes(appointment.scheduledStart, appointment.scheduledEnd);

      for (let index = groupedActive.length - 1; index >= 0; index -= 1) {
        if (groupedActive[index].end <= start) {
          groupedActive.splice(index, 1);
        }
      }

      let column = 0;
      while (groupedActive.some((item) => item.column === column)) {
        column += 1;
      }

      groupedActive.push({ end, column });
      columnAssignments.set(appointment.id, column);
      maxColumns = Math.max(maxColumns, groupedActive.length);
    }

    for (const appointment of cluster) {
      laidOut.push(getEventStyle(appointment, columnAssignments.get(appointment.id) ?? 0, maxColumns));
    }
  }

  for (const appointment of sorted) {
    const start = getMinutesFromStart(appointment.scheduledStart);
    const end = start + getDurationMinutes(appointment.scheduledStart, appointment.scheduledEnd);

    active = active.filter((item) => item.end > start);

    if (active.length === 0 && currentCluster.length > 0) {
      flushCluster(currentCluster);
      currentCluster = [];
    }

    currentCluster.push(appointment);
    active.push({ end });
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
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getDateInputValue(new Date()));
  const [view, setView] = useState<View>("day");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingScrollRef = useRef<"header" | "body" | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedDayAppointments = useMemo(
    () => appointments.filter((appointment) => isSameCalendarDay(appointment.scheduledStart, selectedDate)),
    [appointments, selectedDate]
  );

  const unassignedAppointments = useMemo(
    () => selectedDayAppointments.filter((appointment) => !appointment.technicianId),
    [selectedDayAppointments]
  );

  const totalHours = END_HOUR - START_HOUR;
  const timelineHeight = totalHours * HOUR_HEIGHT;
  const hours = Array.from({ length: totalHours + 1 }, (_, index) => START_HOUR + index);
  const timeSlots = Array.from({ length: totalHours * 2 }, (_, index) => ({
    hour: START_HOUR + Math.floor(index / 2),
    minute: index % 2 === 0 ? 0 : 30,
    top: index * HALF_HOUR_HEIGHT,
  }));

  const dayLanes = useMemo<Lane[]>(() => {
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

  const weekLanes = useMemo<Lane[]>(() => {
    const today = getDateInputValue(new Date());

    return getWeekDays(selectedDate).map((dateStr) => {
      const dayAppointments = appointments.filter((appointment) => isSameCalendarDay(appointment.scheduledStart, dateStr));
      const { weekday, date } = formatWeekDayHeader(dateStr);

      return {
        id: dateStr,
        title: weekday,
        subtitle: date,
        isToday: dateStr === today,
        color: "#2563eb",
        events: layoutLaneAppointments(dayAppointments),
      };
    });
  }, [appointments, selectedDate]);

  const activeLanes = view === "day" ? dayLanes : weekLanes;
  const laneGridStyle = {
    ["--lane-count" as string]: String(activeLanes.length),
    ["--lane-min-width" as string]: view === "week" ? "150px" : "220px",
  };

  const appointmentsToday = appointments.filter((appointment) =>
    isSameCalendarDay(appointment.scheduledStart, getDateInputValue(new Date()))
  ).length;

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  function syncHorizontalScroll(source: "header" | "body", event: UIEvent<HTMLDivElement>) {
    const nextScrollLeft = event.currentTarget.scrollLeft;

    if (syncingScrollRef.current && syncingScrollRef.current !== source) {
      syncingScrollRef.current = null;
      return;
    }

    syncingScrollRef.current = source;

    if (source === "header" && bodyScrollRef.current) {
      bodyScrollRef.current.scrollLeft = nextScrollLeft;
    }

    if (source === "body" && headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = nextScrollLeft;
    }
  }

  function navigateToEditAppointment(appointmentId: string) {
    router.push(`/admin/appointments/${appointmentId}`);
  }

  function handleSlotClick(lane: Lane, hour: number, minute: number) {
    const startDate = new Date(`${selectedDate}T00:00:00`);
    startDate.setHours(hour, minute, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    const matchingAppointment = lane.events
      .filter((appointment) => intersectsWindow(appointment, startDate, endDate))
      .sort(
        (left, right) =>
          Math.abs(new Date(left.scheduledStart).getTime() - startDate.getTime()) -
          Math.abs(new Date(right.scheduledStart).getTime() - startDate.getTime())
      )[0];

    if (matchingAppointment) {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      setPendingAppointmentId(matchingAppointment.id);
      navigationTimeoutRef.current = setTimeout(() => {
        navigateToEditAppointment(matchingAppointment.id);
      }, 260);
      return;
    }

    const searchParams = new URLSearchParams({
      start: getDateTimeInputValue(startDate),
      end: getDateTimeInputValue(endDate),
      date: selectedDate,
    });

    if (lane.id !== "unassigned") {
      searchParams.set("technicianId", lane.id);
    }

    router.push(`/admin/scheduler/${business.id}?${searchParams.toString()}`);
  }

  return (
    <div className={styles.pageLayout}>
      <div className={`${styles.shell} ${view === "week" ? styles.shellWeek : ""}`}>
        <aside className={`${styles.sidebar} ${view === "week" ? styles.sidebarHidden : ""}`}>
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
              <h2 className={styles.topTitle}>
                {view === "day" ? formatLongDate(selectedDate) : formatWeekRange(selectedDate)}
              </h2>
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
                <button
                  type="button"
                  className={`${styles.toggleButton} ${view === "day" ? styles.activeToggle : ""}`}
                  onClick={() => setView("day")}
                >
                  Day
                </button>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${view === "week" ? styles.activeToggle : ""}`}
                  onClick={() => setView("week")}
                >
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
              <div
                ref={headerScrollRef}
                className={styles.headerScroll}
                onScroll={(event) => syncHorizontalScroll("header", event)}
              >
                <div
                  className={`${styles.lanesHeader} ${view === "week" ? styles.weekGrid : ""}`}
                  style={laneGridStyle}
                >
                  {activeLanes.map((lane) => (
                    <div
                      key={lane.id}
                      className={`${styles.laneHeaderCard} ${lane.isToday ? styles.todayHeader : ""}`}
                      onClick={view === "week" ? () => {
                        setSelectedDate(lane.id);
                        setView("day");
                      } : undefined}
                      style={view === "week" ? { cursor: "pointer" } : undefined}
                    >
                      <div className={styles.laneHeaderTitle}>
                        {lane.isToday ? null : (
                          <span className={styles.laneHeaderDot} style={{ backgroundColor: lane.color }} />
                        )}
                        <strong>{lane.title}</strong>
                        {lane.isToday ? <span className={styles.todayBadge}>Today</span> : null}
                      </div>
                      <p>{lane.subtitle}</p>
                    </div>
                  ))}
                </div>
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

              <div
                ref={bodyScrollRef}
                className={styles.bodyScroll}
                onScroll={(event) => syncHorizontalScroll("body", event)}
              >
                <div
                  className={`${styles.laneColumns} ${view === "week" ? styles.weekGrid : ""}`}
                  style={laneGridStyle}
                >
                  {activeLanes.map((lane) => (
                    <div
                      key={lane.id}
                      className={`${styles.laneColumn} ${lane.isToday ? styles.todayColumn : ""}`}
                      style={{ height: `${timelineHeight}px` }}
                    >
                      {view === "day"
                        ? timeSlots.map(({ hour, minute, top }) => (
                            <button
                              key={`${lane.id}-${hour}-${minute}`}
                              type="button"
                              className={styles.hourClickTarget}
                              style={{ top: `${top}px`, height: `${HALF_HOUR_HEIGHT}px` }}
                              onClick={() => handleSlotClick(lane, hour, minute)}
                              aria-label={`Schedule a two-hour appointment at ${formatSlotLabel(hour, minute)} for ${lane.title}`}
                            />
                          ))
                        : null}

                      {hours.map((hour, index) =>
                        index === hours.length - 1 ? null : (
                          <div key={hour} className={styles.hourLine} style={{ top: `${index * HOUR_HEIGHT}px` }} />
                        )
                      )}

                      {lane.events.length === 0 ? (
                        <div className={styles.emptyLane}>Nothing scheduled.</div>
                      ) : null}

                      {lane.events.map((appointment) => (
                        <article
                          key={appointment.id}
                          className={`${styles.eventCard} ${styles[appointment.status] ?? ""} ${
                            pendingAppointmentId === appointment.id ? styles.eventCardActive : ""
                          }`}
                          onClick={() => navigateToEditAppointment(appointment.id)}
                          style={{
                            top: `${appointment.top}px`,
                            height: `${appointment.height}px`,
                            left: appointment.left,
                            width: appointment.width,
                            borderLeftColor: appointment.technician?.color || lane.color,
                          }}
                        >
                          <div className={styles.eventTime}>
                            {formatTime(appointment.scheduledStart)} - {formatTime(appointment.scheduledEnd)}
                          </div>
                          <h3>{appointment.title}</h3>
                          <p className={styles.eventCustomer}>{appointment.customerName}</p>
                          {appointment.location ? <p>{appointment.location}</p> : null}
                          {view === "week" && appointment.technician ? <p>{appointment.technician.name}</p> : null}
                          {view === "day" && appointment.lead ? <p>Lead: {appointment.lead.name}</p> : null}
                          {appointment.notes ? <p>{appointment.notes}</p> : null}
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
