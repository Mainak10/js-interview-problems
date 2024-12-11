/**
 * 
Implement an analytics SDK that exposes log events, it takes in events and queues them, and then starts sending the events. This is a Flipkart frontend interview question.
Send each event after a delay of 1 second and this logging fails every n % 5 times.
Send the next event only after the previous one resolves.
When the failure occurs attempt a retry.
 */

class SDK {
  constructor() {
    this.events = [];
    this.count = 1;
  }

  logEvent(event) {
    this.events.push(event);
  }

  #wait(data) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (this.count % 5 > 0) {
          res(data);
          this.count++;
        } else {
          rej(data);
          this.count = 1;
        }
      }, 1000);
    });
  }

  async send() {
    while (this.events.length > 0) {
      let topEvent = this.events.shift();
      try {
        let response = await this.#wait(topEvent);
        console.log("Resolved", response);
      } catch (e) {
        console.log("Failed to send", topEvent);
        console.log("Retrying...", topEvent);
        this.events.unshift(topEvent);
        await this.send();
      }
    }
  }
}

const sdk = new SDK();

sdk.logEvent("event 1");
sdk.logEvent("event 2");
sdk.logEvent("event 3");
sdk.logEvent("event 4");
sdk.logEvent("event 5");
sdk.logEvent("event 6");
sdk.logEvent("event 7");
sdk.logEvent("event 8");
sdk.logEvent("event 9");
sdk.logEvent("event 10");

sdk.send();
