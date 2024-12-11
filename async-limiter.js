const t1 = () => new Promise((res, rej) => setTimeout(res, 10000, "Task 1"));
const t2 = () => new Promise((res, rej) => setTimeout(res, 11000, "Task 2"));
const t3 = () => new Promise((res, rej) => setTimeout(res, 14000, "Task 3"));
const t4 = () => new Promise((res, rej) => setTimeout(res, 1000, "Task 4"));
const t5 = () => new Promise((res, rej) => setTimeout(res, 900, "Task 5"));
const t6 = () => new Promise((res, rej) => setTimeout(res, 6000, "Task 6"));
const t7 = () => new Promise((res, rej) => setTimeout(res, 1500, "Task 7"));

function Executor(concurrency) {
  this.defaultCount = concurrency;
  this.running = 0;
  this.taskQueue = [];
}
Executor.prototype.push = function (task) {
  this.taskQueue.push(task);
  this.runNext();
};

Executor.prototype.runNext = function () {
  if (this.running < this.defaultCount && this.taskQueue.length > 0) {
    this.running++;
    let taskToExec = this.taskQueue.shift();
    taskToExec().then((el) => {
      console.log(el);
      this.running--;
      this.runNext();
    });
  }
};

const ex = new Executor(3);
ex.push(t1);
ex.push(t2);
ex.push(t3);
ex.push(t4);
ex.push(t5);
ex.push(t6);
ex.push(t7);
