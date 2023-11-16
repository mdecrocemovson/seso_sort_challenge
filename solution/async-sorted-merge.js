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

  async initializeHeap() {
    for (let i = 0; i < this.logSources.length; i++) {
      await this.fetchAndInsertNextEntry(i);
    }
  }

  async fetchAndInsertNextEntry(sourceIndex) {
    const entry = await this.logSources[sourceIndex].popAsync();
    if (entry) {
      this.minHeap.enqueue({ entry, sourceIndex });
    }
  }

  async mergeAndPrint() {
    while (!this.minHeap.isEmpty()) {
      const { entry, sourceIndex } = this.minHeap.dequeue();
      this.printer.print(entry);

      if (!this.logSources[sourceIndex].drained) {
        await this.fetchAndInsertNextEntry(sourceIndex);
      }
    }
    this.printer.done();
  }
};

module.exports = {
  LogMergerAsync,
  customComparator
}