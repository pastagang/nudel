/*
cyclist.mjs - event scheduler for a single strudel instance. for multi-instance scheduler, see - see <https://github.com/tidalcycles/strudel/blob/main/packages/core/neocyclist.mjs>
Copyright (C) 2022 Strudel contributors - see <https://github.com/tidalcycles/strudel/blob/main/packages/core/cyclist.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { logger } from '@strudel/core';

// zyklus.mjs
// see https://loophole-letters.vercel.app/web-audio-scheduling
// maybe we can try https://garten.salat.dev/webaudio/clock.html as an alternative
function createClock(
  getTime,
  callback, // called slightly before each cycle
  duration = 0.05, // duration of each cycle
  interval = 0.1, // interval between callbacks
  overlap = 0.1, // overlap between callbacks
  setInterval = globalThis.setInterval,
  clearInterval = globalThis.clearInterval,
  round = true,
) {
  let tick = 0; // counts callbacks
  let phase = 0; // next callback time
  let precision = 10 ** 4; // used to round phase
  let minLatency = 0.01;
  const setDuration = (setter) => (duration = setter(duration));
  overlap = overlap || interval / 2;
  const onTick = () => {
    const t = getTime();
    const lookahead = t + interval + overlap; // the time window for this tick
    if (phase === 0) {
      phase = t + minLatency;
    }
    // callback as long as we're inside the lookahead
    while (phase < lookahead) {
      phase = round ? Math.round(phase * precision) / precision : phase;
      callback(phase, duration, tick, t); // callback has to skip / handle phase < t!
      phase += duration; // increment phase by duration
      tick++;
    }
  };
  let intervalID;
  const start = () => {
    clear(); // just in case start was called more than once
    onTick();
    intervalID = setInterval(onTick, interval * 1000);
  };
  const clear = () => {
    intervalID !== undefined && clearInterval(intervalID);
    intervalID = undefined;
  };
  const pause = () => clear();
  const stop = () => {
    tick = 0;
    phase = 0;
    clear();
  };
  const getPhase = () => phase;
  // setCallback
  return { setDuration, start, stop, pause, duration, interval, getPhase, minLatency };
}
export default createClock;

export class NudelCyclist {
  constructor({
    interval,
    onTrigger,
    onToggle,
    onError,
    getTime,
    latency = 0.1, // min time until next hap is scheduled each tick
    setInterval,
    clearInterval,
    beforeStart,
  }) {
    this.started = false;
    this.beforeStart = beforeStart;
    this.cps = 0.5;
    this.num_ticks_since_cps_change = 0;
    this.lastTick = 0; // absolute time when last tick (clock callback) happened
    this.lastBegin = 0; // query begin of last tick
    this.lastEnd = 0; // query end of last tick
    this.getTime = getTime; // get absolute time
    this.num_cycles_at_cps_change = 0;
    this.seconds_at_cps_change; // clock phase when cps was changed
    this.onToggle = onToggle;
    this.latency = latency; // fixed trigger time offset
    this.clock = createClock(
      getTime,
      // called slightly before each cycle
      (phase, duration) => {
        if (this.num_ticks_since_cps_change === 0) {
          // @ts-ignore
          parent.initSync(getTime());
          this.num_cycles_at_cps_change = this.lastEnd;
          this.seconds_at_cps_change = phase;
        }
        this.num_ticks_since_cps_change++;
        const seconds_since_cps_change = this.num_ticks_since_cps_change * duration;
        const num_cycles_since_cps_change = seconds_since_cps_change * this.cps;

        try {
          const begin = this.lastEnd;
          this.lastBegin = begin;
          const end = this.num_cycles_at_cps_change + num_cycles_since_cps_change;
          this.lastEnd = end;
          this.lastTick = phase;

          // calculate time until "begin"
          const beginTarget = (begin - this.num_cycles_at_cps_change) / this.cps + this.seconds_at_cps_change + latency;
          const beginDeadline = beginTarget - phase;

          // console.log('beginDeadline', beginDeadline);
          // skip whole tick when deadline is not met
          if (beginDeadline < 0) {
            // avoid querying haps that are in the past anyway
            console.log(`skip query: too late honey`);
            return;
          }

          const a = begin + parent.getSyncOffset() * this.cps;
          const b = end + parent.getSyncOffset() * this.cps;
          // console.log('a', a.toFixed(2));
          // query the pattern for events
          const haps = this.pattern.queryArc(a, b, {
            _cps: this.cps,
          });

          haps.forEach((hap) => {
            if (hap.hasOnset()) {
              const targetTime =
                (hap.whole.begin - this.num_cycles_at_cps_change) / this.cps +
                this.seconds_at_cps_change +
                latency -
                parent.getSyncOffset();
              // console.log('target', targetTime);
              const duration = hap.duration / this.cps;
              // the following line is dumb and only here for backwards compatibility
              // see https://github.com/tidalcycles/strudel/pull/1004
              const deadline = targetTime - phase;
              onTrigger?.(hap, deadline, duration, this.cps, targetTime);
              if (hap.value.cps !== undefined && this.cps != hap.value.cps) {
                this.cps = hap.value.cps;
                this.num_ticks_since_cps_change = 0;
              }
            }
          });
        } catch (e) {
          // @ts-expect-error
          logger(`[cyclist] error: ${e.message}`);
          onError?.(e);
        }
      },
      interval, // duration of each cycle
      0.1,
      0.1,
      setInterval,
      clearInterval,
    );
  }
  now() {
    if (!this.started) {
      return 0;
    }
    const secondsSinceLastTick = this.getTime() - this.lastTick - this.clock.duration;
    return this.lastBegin + secondsSinceLastTick * this.cps + parent.getSyncOffset() * this.cps;
  }
  setStarted(v) {
    this.started = v;
    this.onToggle?.(v);
  }
  async start() {
    await this.beforeStart?.();
    this.num_ticks_since_cps_change = 0;
    this.num_cycles_at_cps_change = 0;
    if (!this.pattern) {
      throw new Error('Scheduler: no pattern set! call .setPattern first.');
    }
    logger('[cyclist] start');
    this.clock.start();
    this.setStarted(true);
  }
  pause() {
    logger('[cyclist] pause');
    this.clock.pause();
    this.setStarted(false);
  }
  stop() {
    logger('[cyclist] stop');
    this.clock.stop();
    this.lastEnd = 0;
    this.setStarted(false);
  }
  async setPattern(pat, autostart = false) {
    this.pattern = pat;
    if (autostart && !this.started) {
      await this.start();
    }
  }
  setCps(cps = 0.5) {
    if (this.cps === cps) {
      return;
    }
    this.cps = cps;
    this.num_ticks_since_cps_change = 0;
  }
  log(begin, end, haps) {
    const onsets = haps.filter((h) => h.hasOnset());
    console.log(`${begin.toFixed(4)} - ${end.toFixed(4)} ${Array(onsets.length).fill('I').join('')}`);
  }
}
