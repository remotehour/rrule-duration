import { CalendarEvent } from './CalendarEvent'
import { RRule } from 'rrule'
import test from 'ava'

test('CalendarEvent - init with hour and minute, occurences', (t) => {
  const event = new CalendarEvent({
    start: {
      hour: 10,
      minute: 0,
    },
    end: {
      hour: 10,
      minute: 30,
    },
    recurrences: [
      new RRule({
        freq: 1,
        dtstart: new Date('2020-09-27T09:08:24.000Z'),
        bymonthday: [],
        byweekday: [RRule.FR.nth(3)],
      }),
    ],
  })

  t.is(event.toText(), '10:00 AM to 10:30 AM every month on the 3rd Friday')

  t.deepEqual(
    event.occurences({
      between: [new Date('2020-09-01T00:00:00'), new Date('2020-12-31T00:00:00')],
    }),
    [
      [new Date('2020-10-16T10:00:00Z'), new Date('2020-10-16T10:30:00Z')],
      [new Date('2020-11-20T10:00:00Z'), new Date('2020-11-20T10:30:00Z')],
      [new Date('2020-12-18T10:00:00Z'), new Date('2020-12-18T10:30:00Z')],
    ],
  )
})

test('CalendarEvent - toText format & time zone', (t) => {
  const event = new CalendarEvent({
    start: {
      dateTime: '2000-01-01T18:00:00Z',
    },
    end: {
      dateTime: '2000-01-01T21:00:00Z',
    },
    recurrences: [
      new RRule({
        freq: RRule.DAILY,
        byweekday: [RRule.MO, RRule.FR],
      }),
      new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 25,
      }),
    ],
  })

  t.is(event.toText(), '6:00 PM to 9:00 PM every day on Monday, Friday and every month on the 25th')

  t.is(
    event.toText({ tz: 'Pacific/Pago_Pago', joinDatesWith: ' / ' }),
    '7:00 AM to 10:00 AM every day on Monday, Friday / every month on the 25th',
  )

  // Plus date
  t.is(
    event.toText({ tz: 'Asia/Tokyo' }),
    '3:00 AM to 6:00 AM every day on Tuesday, Saturday and every month on the 26th',
  )

  // Plus date, only end
  t.is(
    event.toText({ tz: 'Asia/Samarkand' }),
    '11:00 PM to the next day of 2:00 AM every day on Monday, Friday and every month on the 25th',
  )
})
