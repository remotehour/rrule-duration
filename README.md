[![test](https://github.com/remotehour/rrule-duration/actions/workflows/test.yml/badge.svg)](https://github.com/remotehour/rrule-duration/actions/workflows/test.yml)
[![release](https://github.com/remotehour/rrule-duration/actions/workflows/release.yml/badge.svg)](https://github.com/remotehour/rrule-duration/actions/workflows/release.yml)

# rrule-duration

[![npm version](https://badge.fury.io/js/rrule-duration.svg)](https://badge.fury.io/js/rrule-duration)

Add duration feature and time zone support to [RRule](https://github.com/jakubroztocil/rrule).

# Features

- Create events with duration and represent it with RRule
- Time zone support, even separate start/end time
- Dump duration as natural language

# Install

```
npm install --save rrule rrule-duration
```

Or if you use Yarn:

```
yarn add rrule rrule-duration
```

# Basic Usage

`CalendarEvent` class is intended to use `RRule` with calendar events. Basically an `event` is represented by `start`, `end` and `RRule`. Let's see an example event.

```typescript
import { RRule } from 'rrule'
import { CalendarEvent } from 'rrule-duration'

const event = new CalendarEvent({
  start: {
    hour: 10,
    minute: 0,
    tz: 'UTC',
  },
  end: {
    hour: 22,
    minute: 30,
    tz: 'Asia/Tokyo',
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
event.occurences({
  between: [new Date('2020-10-01T00:00:00Z'), new Date('2020-12-31T00:00:00Z')],
})
```

It will return the following array:

```typescript
[
  [new Date('2020-10-16T10:00:00Z'), new Date('2020-10-16T13:30:00Z')],
  [new Date('2020-11-20T10:00:00Z'), new Date('2020-11-20T13:30:00Z')],
  [new Date('2020-12-18T10:00:00Z'), new Date('2020-12-18T13:30:00Z')],
],
```

Note it includes start and end in plain `Date` type.

# Natural Language

You can also get event text as natural language (currently only in English) text.

```typescript
event.toText()
// => 10:00 AM to 13:30 AM every day on Monday, Friday and every month on the 25th
```

# Time Zone Support

The most powerful feature of `CalendarEvent` is strong time zone support. We, Remotehour, provides our service globally so this feature has been developed. In the above example, you can pass a `tz` option to `toText` method.

```typescript
event.toText({ tz: 'Asia/Tokyo' })
// => 7:00 PM to 10:30 PM every day on Monday, Friday and every month on the 25th

event.toText({ tz: 'Pacific/Pago_Pago' })
// => 11:00 PM to the next day of 2:30 AM every day on Sunday, Thursday and every month on the 24th
```
