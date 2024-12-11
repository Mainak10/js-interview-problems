const ALL_FEATURES = {
  show_new_checkout_v2: true,
  enable_new_carousal: true,
};

class FeatureFlagService {
  constructor(ttl, maxRetry, initialDelay) {
    this.MAX_TTL = ttl;
    this.MAX_RETRY = maxRetry;
    this.INITIAL_DELAY = initialDelay;

    this.featureFlagsKey = "featureFlags";
    this.cache = {
      featureFlags: null,
      featureInstance: null,
      timeStamp: null,
    };
    this.loadLocalStorage();
  }

  loadLocalStorage() {
    const store = localStorage.getItem(this.featureFlagsKey);
    if (store !== null && store.length > 0) {
      const { featureFlags, timeStamp } = JSON.parse(store);
      if (Date.now() - timeStamp < this.MAX_TTL) {
        this.cache.featureFlags = featureFlags;
        this.cache.timeStamp = timeStamp;
      }
    }
  }

  setLocalStorage(featureFlags) {
    localStorage.setItem(
      this.featureFlagsKey,
      JSON.stringify({ featureFlags, timeStamp: Date.now() })
    );
  }
  async setFeatures() {
    if (
      this.cache.featureFlags !== null &&
      this.cache.timeStamp !== null &&
      Date.now() - this.cache.timeStamp < this.MAX_TTL
    ) {
      return this.cache.featureFlags;
    }

    if (!this.cache.featureInstance) {
      this.cache.featureInstance = this.fetchAllFeatures();
    }

    try {
      const allFeatureFlags = await this.cache.featureInstance;
      this.cache.featureFlags = allFeatureFlags;
      this.cache.timeStamp = Date.now();
      this.cache.featureInstance = null;
      this.setLocalStorage(allFeatureFlags);
      return allFeatureFlags;
    } catch (e) {
      return {};
    }
  }
  async getFeatureState(featureName, defaultValue) {
    try {
      const allFeatureFlags = await this.setFeatures();
      const flagValue = allFeatureFlags.hasOwnProperty(featureName)
        ? allFeatureFlags[featureName]
        : defaultValue;

      return flagValue;
    } catch (e) {
      return defaultValue;
    }
  }

  async fetchAllFeatures(retry = 0) {
    console.log("Calling BE");
    try {
      const response = await new Promise((res, rej) => {
        if (Math.random() > 0.5) res(ALL_FEATURES);
        else rej("Error while fetching BE");
      });
      return response;
    } catch (err) {
      if (retry < this.MAX_RETRY) {
        let delay = this.INITIAL_DELAY * Math.pow(2, retry);
        console.log(`retrying after ${delay / 1000} secs `);
        await new Promise((res) => setTimeout(res, delay));
        return this.fetchAllFeatures(retry + 1);
      }
    }
  }
}

const ffService = new FeatureFlagService(5000, 3, 1000);

ffService.getFeatureState("show_new_checkout_v2").then((el) => console.log(el));
ffService.getFeatureState("enable_new_carousal").then((el) => console.log(el));
ffService.getFeatureState("show_new_checkout_v2").then((el) => console.log(el));
setTimeout(() => {
  ffService
    .getFeatureState("enable_new_carousal")
    .then((el) => console.log(el + " after timeout"));
}, 7000);
