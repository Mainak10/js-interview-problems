class BlogClient {
  constructor(baseUrl, authenticationKey, maxTtl = 4000, maxRetry = 3) {
    this.MAX_TTL = maxTtl;
    this.MAX_RETRY = maxRetry;
    this.INIT_DELAY = 2000;
    this.BASE_URL = baseUrl;
    this.AUTH_KEY = authenticationKey;
    this.cache = new Map();
  }

  async getPost(id) {
    if (!isValidId(id)) {
      throw new Error("Invalid ID");
    }
    return this.cachedRequest(`/path?id=${id}`, HTTP_METHODS.GET);
  }

  async getAllPosts() {
    return this.cachedRequest(`/path`, HTTP_METHODS.GET);
  }

  async createPost(postData) {
    if (!isRequestBodyValid(postData)) {
      throw new Error("Invalid post data");
    }
    const result = await this.makeRequest(`/path`, HTTP_METHODS.POST, postData);
    this.invalidateCache(`/path`);
    return result;
  }

  async deletePost(id) {
    if (!isValidId(id)) {
      throw new Error("Invalid ID");
    }
    const result = await this.makeRequest(
      `/path?id=${id}`,
      HTTP_METHODS.DELETE
    );
    this.invalidateCache(`/path?id=${id}`);
    this.invalidateCache(`/path`);
    return result;
  }

  async updatePost(id, postData) {
    if (!isValidId(id) || !isRequestBodyValid(postData)) {
      throw new Error("Invalid ID or post data");
    }
    const result = await this.makeRequest(
      `/path?id=${id}`,
      HTTP_METHODS.PUT,
      postData
    );
    this.invalidateCache(`/path?id=${id}`);
    this.invalidateCache(`/path`);
    return result;
  }

  async cachedRequest(endpoint, method, body = null) {
    const cacheKey = `${endpoint}_${method}`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.MAX_TTL) {
      return cachedData.data;
    }

    const response = await this.makeRequest(endpoint, method, body);

    if (method === HTTP_METHODS.GET) {
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
    }

    return response;
  }

  invalidateCache(endpoint) {
    for (let key of this.cache.keys()) {
      if (key.startsWith(`${endpoint}_`)) {
        this.cache.delete(key);
      }
    }
  }

  async makeRequest(endpoint, method, body = null, retry = 0) {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.AUTH_KEY}`,
    });

    const options = {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : null,
    };

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed (attempt ${retry + 1}):`, error);

      if (retry < this.MAX_RETRY) {
        const delay = this.INIT_DELAY * Math.pow(2, retry);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, method, body, retry + 1);
      }

      throw error;
    }
  }
}
