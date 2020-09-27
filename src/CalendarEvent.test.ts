import { CalendarEvent } from './CalendarEvent'
import { RRule } from 'rrule'
import test from 'ava'
import dayjs from 'dayjs'

test('CalendarEvent', (t) => {
  const event = new CalendarEvent({
    start: {
      dateTime: dayjs().hour(18).minute(0).second(0).toDate(),
    },
    end: {
      dateTime: dayjs().hour(21).minute(0).second(0).toDate(),
    },
    recurrences: [
      new RRule({
        freq: RRule.DAILY,
        byweekday: [RRule.MO, RRule.FR],
      }),
    ],
  })

  t.is(event.toText(), 'every day on Monday, Friday 18:00 AM to 21:00 AM')
  t.is(event.toText({ tz: 'Asia/Tokyo' }), 'every day on Tuesday, Saturday 3:00 AM to 6:00 PM')
  // t.is(event.occurences({ count: 5 }), [
  //   // TODO
  // ])
})
