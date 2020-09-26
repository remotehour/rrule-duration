import { RRule } from 'rrule'

interface RRuleDurationArgs {
  duration: number
  rrule: RRule
}

export class RRuleDuration {
  rrule: RRule
  duration: number

  constructor({ rrule, duration }: RRuleDurationArgs) {
    this.rrule = rrule
    this.duration = duration
  }

  getEnds() {
    return this.rrule.options.byhour[0] + this.duration / 1000 / 60 / 60
  }

  toText() {
    return `${this.rrule.toText()} to ${this.getEnds()}`
  }
}
