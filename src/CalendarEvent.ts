import { RRule, RRuleSet } from 'rrule'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

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
  tz?: string
}

const INITIAL_DATE = new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0))

export class CalendarEvent {
  private start: dayjs.Dayjs
  private end: dayjs.Dayjs
  private recurrences: RRuleSet

  constructor({ start, end, recurrences }: CalendarEventArgs) {
    if ((start.hour === undefined || start.minute === undefined) && !start.dateTime) {
      throw new Error('invalid "start" value. Either spcify dateTime or hour/minutes')
    }
    if ((end.hour === undefined || end.minute === undefined) && !end.dateTime) {
      throw new Error('invalid "end" value. Either spcify dateTime or hour/minutes')
    }

    this.start = dayjs.tz(start.dateTime || INITIAL_DATE, start.tz || 'UTC')
    if (Number.isInteger(start.hour) && Number.isInteger(start.minute)) {
      this.start = this.start.hour(start.hour!).minute(start.minute!)
    }

    this.end = dayjs.tz(end.dateTime || INITIAL_DATE, end.tz || 'UTC')
    if (Number.isInteger(end.hour) && Number.isInteger(end.minute)) {
      this.end = this.end.hour(end.hour!).minute(end.minute!)
    }

    this.recurrences = new RRuleSet()

    recurrences.forEach((r) => this.recurrences.rrule(r))

    // this.recurrences = recurrences.reduce((ruleset: RRuleSet, recurrence) => {
    //   ruleset.rrule(
    //     new RRule({
    //       ...recurrence.options,
    //       // byhour: 0,
    //       // byminute: 0,
    //       // bysecond: 0,
    //     }),
    //   )
    //   return ruleset
    // }, new RRuleSet())
  }

  occurences(args: OccurencesArgs) {
    return this.getOccurences(args).map((date) => {
      const start = dayjs
        .tz(date, args.tz || 'UTC')
        .hour(this.start.hour())
        .minute(this.start.minute())
        .second(0)
        .millisecond(0)
        .toDate()
      const end = dayjs
        .tz(date, args.tz || 'UTC')
        .hour(this.end.hour())
        .minute(this.end.minute())
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

    return this.recurrences.between(new Date(), dayjs().add(1, 'month').toDate())
  }

  toText({ tz = 'UTC', joinDatesWith = ' and ', timeFormat = 'h:mm A' }: ToTextArgs = {}) {
    const start = dayjs.tz(this.start, tz)
    const end = dayjs.tz(this.end, tz)
    const occurencesText = this.recurrences
      .clone()
      .rrules()
      .map((rrule) => {
        if (rrule instanceof RRuleSet) {
          throw new Error('Invalid class: RRuleSet')
        }

        const crossTimezonePrev = this.start.date() > start.date()
        if (crossTimezonePrev) {
          return new RRule({
            ...rrule.options,
            byweekday: rrule.options.byweekday?.map((x) => x - 1),
            bymonthday: rrule.options.bymonthday?.map((x) => x - 1),
          }).toText()
        }

        const crossTimezoneNext = this.start.date() < start.date()
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
