'use strict';

const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

const customComparator = (a) => {
  return a?.entry?.date;
};

class LogMergerAsync {
  constructor(logSources, printer) {
    this.logSources = logSources;
    this.printer = printer;
    this.minHeap = new MinPriorityQueue(customComparator);
  }

  async populateHeap(isRepopulating = false) {
    // protection against minHeap getting too large - this is a tradeoff between memory and speed
    if (this.minHeap.size() > this.logSources.length * 100 && isRepopulating) return;
    let promises = [];
    const filteredLogs = this.logSources.filter(source => !source.drained);
    for (let i = 0; i < filteredLogs.length; i++) {
      promises.push(this.fetchAndInsertNextEntry(filteredLogs, i));
    }
    return Promise.all(promises);
  }


  async fetchAndInsertNextEntry(filteredLogs, sourceIndex) {
    const entry = await filteredLogs[sourceIndex].popAsync();
    if (entry) {
      this.minHeap.enqueue({ entry, sourceIndex });
    }
  }

  async mergeAndPrint() {
    while (this.logSources.filter(source => !source.drained).length > 0) {
      while (!this.minHeap.isEmpty()) {
        const { entry } = this.minHeap.dequeue();
        this.printer.print(entry);
        await this.populateHeap(true);
      }
    }
    this.printer.done();
  }
};

module.exports = {
  LogMergerAsync,
  customComparator
}