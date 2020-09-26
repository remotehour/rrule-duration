import { RRuleDuration } from './duration'
import { RRule } from 'rrule'
import test from 'ava'

const ONE_HOUR = 1000 * 60 * 60

test('RRuleDuration', (t) => {
  const rrule = new RRule({
    freq: RRule.DAILY,
    // byweekday: [RRule.MO, RRule.TH],
    byhour: 17,
    byminute: 0,
    bysecond: 0,
  })

  const rd = new RRuleDuration({
    rrule,
    duration: ONE_HOUR,
  })

  t.is(rd.toText(), 'every day at 17 to 18')
})
