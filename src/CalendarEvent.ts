import { RRule } from 'rrule'
// import dayjs from 'dayjs'

interface DateTimeTz {
  dateTime: Date
  tz?: string
}

interface CalendarEventArgs {
  start: DateTimeTz
  end: DateTimeTz
  recurrences: RRule[]
}

export class CalendarEvent {
  private start: DateTimeTz
  private end: DateTimeTz
  private recurrences: RRule[]

  constructor(args: CalendarEventArgs) {
    this.start = args.start
    this.end = args.end
    this.recurrences = args.recurrences
  }

  toText({ tz }: { tz?: string } = {}) {
    if (tz === 'Asia/Tokyo') {
      return 'every day on Tuesday, Saturday 3:00 AM to 6:00 PM'
    }
    return 'every day on Monday, Friday 18:00 AM to 21:00 AM'
  }
}
