const fetchWithRetryExponentialBackoff = (
  callback,
  maxRetry,
  initialInterval
) => {
  return new Promise((res, rej) => {
    let retryCount = 0;
    const helper = async () => {
      try {
        const response = await callback();
        res(response);
      } catch (err) {
        retryCount++;
        if (retryCount <= maxRetry) {
          const retryInterval = initialInterval * Math.pow(2, retryCount - 1);
          console.log(`Retry attempt ${retryCount} in ${retryInterval}`);
          setTimeout(helper, initialInterval);
        } else {
          rej(err.toString());
        }
      }
    };

    helper(); // Call helper immediately
  });
};

const getData1 = async () => {
  const res = await fetch("https://jsonpleholder.typicode.com/todos/1");
  return await res.json();
};
const getData2 = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/2");
  return await res.json();
};
const getData3 = async () => {
  const res = await fetch("https://jsonplacholder.typicode.com/todos/8");
  return await res.json();
};

const getAllData = async (promiseArr, retryCount, initialDelay) => {
  for (let promise of promiseArr) {
    try {
      let response = await fetchWithRetryExponentialBackoff(
        promise,
        retryCount,
        initialDelay
      );
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }
};

getAllData([getData1, getData2, getData3], 3, 2000);
