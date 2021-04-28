import { RRule, RRuleSet } from 'rrule'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault('UTC')

interface CalendarEventDef {
  dateTime?: Date | string
  hour?: number
  minute?: number
  tz?: string
}

interface CalendarEventArgs {
  start: CalendarEventDef
  end: CalendarEventDef
  recurrences: RRule[]
}

interface ToTextArgs {
  tz?: string
  joinDatesWith?: string
  timeFormat?: string
}

interface OccurencesArgs {
  between?: [Date, Date]
  until?: Date
}

const INITIAL_DATE = new Date(Date.UTC(2000, 0, 15, 0, 0, 0, 0))

function validateCalendarEventDef(e: CalendarEventDef, name: string) {
  if ((e.hour === undefined || e.minute === undefined) && !e.dateTime) {
    throw new Error(`invalid ${name} value. Either spcify dateTime or hour/minutes`)
  }
}

function hasMinuteHour(e: CalendarEventDef): e is { hour: number; minute: number; tz?: string } {
  return Number.isInteger(e.hour) && Number.isInteger(e.minute)
}

// TODO: Better implementation?
function getOffsetFromTimeZone(d: dayjs.Dayjs) {
  try {
    const diffString = d.format('Z')
    if (!diffString.includes('+')) {
      return 0
    }
    const [hour, minute] = diffString
      .replace('+', '')
      .split(':')
      .map((x) => parseInt(x))
    return -1 * (hour * 60 + minute)
  } catch {
    return 0
  }
}

export class CalendarEvent {
  private start: dayjs.Dayjs
  private end: dayjs.Dayjs
  private recurrences: RRuleSet

  constructor({ start, end, recurrences }: CalendarEventArgs) {
    validateCalendarEventDef(start, 'start')
    validateCalendarEventDef(end, 'end')

    this.start = dayjs.tz(start.dateTime || INITIAL_DATE, start.tz || 'UTC')
    if (hasMinuteHour(start)) {
      this.start = this.start.hour(start.hour).minute(start.minute)
    }

    this.end = dayjs.tz(end.dateTime || INITIAL_DATE, end.tz || 'UTC')
    if (hasMinuteHour(end)) {
      this.end = this.end.hour(end.hour).minute(end.minute)
    }

    this.recurrences = new RRuleSet()

    recurrences.forEach((r) => this.recurrences.rrule(r))
  }

  occurences(args: OccurencesArgs): [Date, Date][] {
    return this.getOccurences(args).map((date) => {
      const start = dayjs
        .utc(date)
        .hour(this.start.hour())
        .minute(this.start.minute())
        .add(getOffsetFromTimeZone(this.start), 'minute')
        .second(0)
        .millisecond(0)
        .toDate()
      const end = dayjs
        .utc(date)
        .hour(this.end.hour())
        .minute(this.end.minute())
        .add(getOffsetFromTimeZone(this.end), 'minute')
        .second(0)
        .millisecond(0)
        .toDate()
      return [start, end]
    })
  }

  getOccurences({ between, until }: OccurencesArgs) {
    if (between) {
      return this.recurrences.between(between[0], between[1])
    }

    if (until) {
      return this.recurrences.between(new Date(), until)
    }

    return this.recurrences.between(new Date(), dayjs.utc().add(1, 'month').toDate())
  }

  toText({ tz = 'UTC', joinDatesWith = ' and ', timeFormat = 'h:mm A' }: ToTextArgs = {}) {
    const start = this.start.tz(tz)
    const end = this.end.tz(tz)

    const occurencesText = this.recurrences
      .clone()
      .rrules()
      .map((rrule) => {
        if (rrule instanceof RRuleSet) {
          throw new Error('Invalid class: RRuleSet')
        }

        const crossTimezonePrev =
          this.start.date() > start.date() || (this.start.date() === 1 && start.date() > 26)
        if (crossTimezonePrev) {
          return new RRule({
            ...rrule.options,
            byweekday: rrule.options.byweekday?.map((x) => x - 1),
            bymonthday: rrule.options.bymonthday?.map((x) => x - 1),
          }).toText()
        }

        const crossTimezoneNext =
          this.start.date() < start.date() || (start.date() === 1 && this.start.date() > 26)
        if (crossTimezoneNext) {
          return new RRule({
            ...rrule.options,
            byweekday: rrule.options.byweekday?.map((x) => x + 1),
            bymonthday: rrule.options.bymonthday?.map((x) => x + 1),
          }).toText()
        }

        return rrule.toText()
      })
      .join(joinDatesWith)

    const startText = start.format(timeFormat)
    const endText = end.format(timeFormat)
    const nextDateNotes = start.day() === end.day() ? '' : 'the next day of '

    return `${startText} to ${nextDateNotes}${endText} ${occurencesText}`
  }
}
