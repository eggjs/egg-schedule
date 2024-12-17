import '../../../../src/index.js';

import { EggAppConfig } from 'egg';

export default {
  schedule: {
    directory: [
      'path/to/otherSchedule',
    ],
  },
} as Partial<EggAppConfig>;
