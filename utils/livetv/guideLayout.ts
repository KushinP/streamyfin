import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

const HOUR_MS = 60 * 60 * 1000;

/** The span of time the phone's guide lays out, in epoch milliseconds. */
export interface GuideWindow {
  start: number;
  end: number;
}

export interface ProgramBlock {
  program: BaseItemDto;
  /** Distance from the window's start, in pixels. */
  left: number;
  width: number;
}

const startOfDay = (time: number) => {
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

const nextDay = (dayStart: number) => {
  const day = new Date(dayStart);
  day.setDate(day.getDate() + 1);
  return day.getTime();
};

/**
 * The guide for `day`: today from the top of the current hour, so what is on
 * now sits at the left edge; any other day from midnight. Both end at the
 * next midnight, by the viewer's clock (setDate keeps a DST day right).
 */
export const guideWindow = (day: Date, now: number): GuideWindow => {
  const dayStart = startOfDay(day.getTime());
  const isToday = dayStart === startOfDay(now);
  const start = isToday ? Math.floor(now / HOUR_MS) * HOUR_MS : dayStart;
  return { start: Math.max(start, dayStart), end: nextDay(dayStart) };
};

const toPx = (ms: number, pxPerHour: number) => (ms / HOUR_MS) * pxPerHour;

/**
 * A channel's programs as blocks on the guide's time axis: each placed by its
 * own start time and cut to the window, so a block always sits under the hour
 * it airs in and a gap in the schedule stays a gap.
 */
export const programBlocks = (
  programs: BaseItemDto[] | null | undefined,
  channelId: string | null | undefined,
  window: GuideWindow,
  pxPerHour: number,
): ProgramBlock[] => {
  if (!programs || !channelId) return [];
  const blocks: (ProgramBlock & { start: number })[] = [];
  for (const program of programs) {
    if (program.ChannelId !== channelId) continue;
    if (!program.StartDate || !program.EndDate) continue;
    const start = Math.max(Date.parse(program.StartDate), window.start);
    const end = Math.min(Date.parse(program.EndDate), window.end);
    if (!(end > start)) continue;
    blocks.push({
      program,
      start,
      left: toPx(start - window.start, pxPerHour),
      width: toPx(end - start, pxPerHour),
    });
  }
  return blocks
    .sort((a, b) => a.start - b.start)
    .map(({ start: _start, ...block }) => block);
};

/** Where the now line goes, or null when the clock is outside the window. */
export const nowLineOffset = (
  now: number,
  window: GuideWindow,
  pxPerHour: number,
): number | null =>
  now >= window.start && now < window.end
    ? toPx(now - window.start, pxPerHour)
    : null;

/** One label for each hour of the window. */
export const guideHours = (window: GuideWindow): Date[] => {
  const hours: Date[] = [];
  for (let time = window.start; time < window.end; time += HOUR_MS) {
    hours.push(new Date(time));
  }
  return hours;
};

/** The days the guide offers: today and the `count - 1` after it. */
export const guideDays = (now: number, count: number): Date[] => {
  const days: Date[] = [];
  let day = startOfDay(now);
  for (let i = 0; i < count; i++) {
    days.push(new Date(day));
    day = nextDay(day);
  }
  return days;
};
