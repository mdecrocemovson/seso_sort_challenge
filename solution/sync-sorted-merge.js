'use strict';

const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

const { customComparator } = require('./async-sorted-merge');

// Print all entries, across all of the sources, in chronological order.


module.exports = class LogMerger {
  constructor(logSources, printer) {
    this.logSources = logSources;
    this.printer = printer;
    this.minHeap = new MinPriorityQueue(customComparator);
    // Initialize the min heap with the first entry from each log source
    this.fetchBatchOfLogs();
  }

  fetchBatchOfLogs() {
    // for each logSource, pop the first entry and add it to the min heap
    for (let i = 0; i < this.logSources.length; i++) {
      this.fetchAndInsertNextEntry(i);
    }
  }

  fetchAndInsertNextEntry(sourceIndex) {
    const entry = this.logSources[sourceIndex].pop();
    if (entry) {
      this.minHeap.enqueue({ entry, sourceIndex });
    }
  }

  mergeAndPrint() {
    // while there's entries in the minHeap
    while (!this.minHeap.isEmpty()) {
      // pop from it
      const { entry, sourceIndex } = this.minHeap.dequeue();
      // print the entry
      this.printer.print(entry);
      // if there's more entries in the log source, fetch and insert the next entry
      if (!this.logSources[sourceIndex].drained) {
        this.fetchAndInsertNextEntry(sourceIndex);
      }
    }
    this.printer.done();
  }

}