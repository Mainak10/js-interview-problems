export default function createStore(reducer, preloadedState) {
  if (typeof reducer !== "function") {
    handleError("Reducer has to be a function type");
  }
  let state = preloadedState;
  let isDispatching = false;
  const listeners = [];

  function getState() {
    if (isDispatching) handleError("can not get.store while dispatching");
    return state;
  }

  function dispatch(action) {
    if (typeof action !== "object" || Array.isArray(action)) {
      handleError("Action has to  be a object");
    }
    if (isDispatching) handleError("can not dispatch while dispatching");

    isDispatching = true;

    try {
      state = reducer(state, action);
    } catch (err) {
      handleError(err);
    } finally {
      isDispatching = false;
    }

    // execute all the listeners

    listeners.forEach((listn) => listn());

    return action;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      handleError("Teh callback has to be a function");
    }
    if (isDispatching) handleError("can not subscribe while dispatching");

    listeners.push(listener);

    return function unsubscribe(listener) {
      let indexOfListener = listeners.indexOf(listener);
      if (indexOfListener !== -1) listeners.splice(indexOfListener, 1);
    };
  }

  return { getState, subscribe, dispatch };
}

function handleError(errType) {
  throw new Error(errType);
}
