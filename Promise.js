const STATE = {
  FULLFILLED: "fullfilled",
  REJECTED: "rejected",
  PENDING: "pending",
};

class MyPromise {
  #state = STATE.PENDING;
  #value = null;
  #thenCb = [];
  #catchCb = [];
  #onSuccessBinded = this.#onSuccess.bind(this);
  #onFailureBinded = this.#onFailure.bind(this);

  constructor(cb) {
    try {
      cb(this.#onSuccessBinded, this.#onFailureBinded);
    } catch (error) {
      this.#onFailureBinded(error);
    }
  }
  #runCallbacks() {
    if (this.#state === STATE.FULLFILLED) {
      this.#thenCb.forEach((task) => {
        task(this.#value);
      });
      this.#thenCb = [];
    }
    if (this.#state === STATE.REJECTED) {
      this.#catchCb.forEach((task) => {
        task(this.#value);
      });
      this.#catchCb = [];
    }
  }
  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;
      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBinded, this.#onFailureBinded);
        return;
      }
      this.#value = value;
      this.#state = STATE.FULLFILLED;
      this.#runCallbacks();
    });
  }
  #onFailure(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;
      if (value instanceof MyPromise) {
        value.then(this.#onSuccessBinded, this.#onFailureBinded);
        return;
      }
      if (this.#catchCb.length === 0) throw new Error("Something Went Wrong!");
      this.#value = value;
      this.#state = STATE.REJECTED;
      this.#runCallbacks();
    });
  }

  then(succCb, errCb) {
    return new MyPromise((resolve, reject) => {
      this.#thenCb.push((result) => {
        if (!succCb) {
          resolve(result);
          return;
        } else {
          try {
            resolve(succCb(result));
          } catch (err) {
            reject(err);
          }
        }
      });
      this.#catchCb.push((result) => {
        if (!errCb) {
          reject(result);
          return;
        } else {
          try {
            resolve(errCb(result));
          } catch (err) {
            reject(err);
          }
        }
      });

      this.#runCallbacks();
    });
  }

  catch(errCb) {
    return this.then(null, errCb);
  }
  finally(cb) {
    return this.then(
      (result) => {
        cb();
        return result;
      },
      (result) => {
        cb();
        throw result;
      }
    );
  }
}

// Example usage:
new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("success"), 1000);
})
  .then((result) => {
    console.log(result);
    return "Another success!";
  })
  .finally(() => console.log("Hello"));
