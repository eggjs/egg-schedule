
3.3.0 / 2018-02-24
==================

  * feat: optimize logger msg (#38)

3.2.1 / 2018-02-07
==================

  * chore: fix doctools (#37)

3.2.0 / 2018-02-06
==================

**features**
  * [[`2003369`](http://github.com/eggjs/egg-schedule/commit/200336963cdf2404b926fa1c36223c41229cf32d)] - feat: egg-schedule.log && support send with args (#35) (TZ | 天猪 <<atian25@qq.com>>)

3.1.1 / 2017-11-20
==================

**fixes**
  * [[`9ff3974`](http://github.com/eggjs/egg-schedule/commit/9ff3974683e1f4ade72ccbe2448a3c68d7826530)] - fix: use ctx.coreLogger to record schedule log (#34) (Yiyu He <<dead_horse@qq.com>>)

3.1.0 / 2017-11-16
==================

**features**
  * [[`69a588e`](https://github.com/eggjs/egg-schedule/commit/69a588e5ffbb5a01ed3084bfb9f6c2a792963db4)] - feat: run a scheduler only once at startup (#33) (zhennann <<zhen.nann@icloud.com>>)

3.0.0 / 2017-11-10
==================

**others**
  * [[`925f1c3`](http://github.com/eggjs/egg-schedule/commit/925f1c38ffb5c8d73e91fe96e6e7fc30c3f43c5f)] - refactor: remove old stype strategy support [BREAKING CHANGE] (#29) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`4cdfa20`](http://github.com/eggjs/egg-schedule/commit/4cdfa204f1da36288328bf30acb0564da1e3d1b5)] - test: change to extend Subscription (#28) (TZ | 天猪 <<atian25@qq.com>>)

2.6.0 / 2017-10-16
==================

**features**
  * [[`f901df4`](http://github.com/eggjs/egg-schedule/commit/f901df4e895d440c9d3bc96e172d3cc87be95255)] - feat: Strategy interface change to start() (#26) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`c7816f2`](http://github.com/eggjs/egg-schedule/commit/c7816f2eb8ca668c92c1671b1d149c78dd73551e)] - feat: support class (#25) (Haoliang Gao <<sakura9515@gmail.com>>)

**others**
  * [[`8797489`](http://github.com/eggjs/egg-schedule/commit/8797489f914a34bf56ecc68575b0b7e490628b5a)] - docs: use subscription (#27) (Haoliang Gao <<sakura9515@gmail.com>>)

2.5.1 / 2017-10-11
==================

  * fix: publish files (#24)

2.5.0 / 2017-10-11
==================

  * refactor: classify (#23)
  * test: sleep after runSchedule (#22)

2.4.1 / 2017-06-06
==================

  * fix: use safe-timers only large than interval && add tests (#21)

2.4.0 / 2017-06-05
==================

  * feat: use safe-timers to support large delay (#19)

2.3.1 / 2017-06-04
==================

  * docs: fix License url (#20)
  * test: fix test on windows (#18)
  * chore: upgrade all deps (#17)

2.3.0 / 2017-02-08
==================

  * feat: task support async function (#13)
  * test: move app.close to afterEach (#12)
  * chore: upgrade deps and fix test (#11)

2.2.1 / 2016-10-25
==================

  * fix: start schedule after egg-ready (#10)

2.2.0 / 2016-09-29
==================

  * feat: export app.schedules (#9)
  * doc:fix plugin.js config demo (#8)

2.1.0 / 2016-08-18
==================

  * refactor: use FileLoader to load schedule files (#7)

2.0.0 / 2016-08-16
==================

  * Revert "Release 1.1.1"
  * refactor: use loader.getLoadUnits from egg-core (#6)

1.1.0 / 2016-08-15
==================

  * docs: add readme (#5)
  * feat: support immediate (#4)

1.0.0 / 2016-08-10
==================

  * fix: correct path in ctx (#3)

0.1.0 / 2016-07-26
==================

  * fix: use absolute path for store key (#2)
  * test: add test cases (#1)

0.0.1 / 2016-07-15
==================

  * init
