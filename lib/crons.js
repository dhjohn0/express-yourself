let path = require('path');
let doWalk = require('./helpers/doWalk');
let cron = require('node-cron');

module.exports = (app, log, config, di) => {
  let cb = (c) => {
    let job = require(c);
    let task = cron.schedule(job.schedule, () => {
      di.invoke(job.task, null, {
        req: null,
        res: null,
        next: null,
        cancel: () => {
          task.stop();
        }
      })
    });
  };

  let localPath = path.join(__dirname, '../', 'crons');
  doWalk(config.paths.crons, cb, '.js');
  if (localPath !== config.paths.crons)
    doWalk(localPath, cb, '.js');
}