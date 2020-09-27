# rrule-contrib

[RRule](https://github.com/jakubroztocil/rrule) related utilities.

# Install

```
npm install --save rrule rrule-contrib
```

Or if you use Yarn:

```
yarn add rrule rrule-contrib
```

# Usage

Currently the following classes are exported:

- CalendarEvent

TODO: add more functionality.

## `CalendarEvent`

`CalendarEvent` class is intended to use `RRule` with calendar events. Basically an `event` is represented by `start`, `end` and `RRule`. Let's see an example event.

```typescript
import { RRule } from 'rrule'
import { CalendarEvent } from 'rrule-contrib'

const event = new CalendarEvent({
  start: {
    hour: 10,
    minute: 0,
  },
  end: {
    hour: 13,
    minute: 30,
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
```

You can get event occurences with `occurences` method.

```typescript
event.toText()
// => 10:00 AM to 13:30 AM every day on Monday, Friday and every month on the 25th

event.occurences({
  between: [new Date('2020-10-01T00:00:00Z'), new Date('2020-12-31T00:00:00Z')],
})
// [
//   [new Date('2020-10-16T10:00:00Z'), new Date('2020-10-16T13:30:00Z')],
//   [new Date('2020-11-20T10:00:00Z'), new Date('2020-11-20T13:30:00Z')],
//   [new Date('2020-12-18T10:00:00Z'), new Date('2020-12-18T13:30:00Z')],
// ],
```

You can get event text as natural language (currently only in English) text.

```typescript
event.toText()
// => 10:00 AM to 13:30 AM every day on Monday, Friday and every month on the 25th
```

**Time zone support**

The most powerful feature of `CalendarEvent` is strong time zone support. We, Remotehour, provides our service globally so this feature has been developed. In the above example, you can pass a `tz` option to `toText` method.

```typescript
event.toText({ tz: 'Asia/Tokyo' })
// => 7:00 PM to 10:30 PM every day on Monday, Friday and every month on the 25th

event.toText({ tz: 'Pacific/Pago_Pago' })
// => 11:00 PM to the next day of 2:30 AM every day on Sunday, Thursday and every month on the 24th
```
