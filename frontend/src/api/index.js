class Api {
  /* Mediates the interaction with the API through HTTP requests */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.baseHeaders = {
      "content-type": "application/json",
    };
  }

  static async getAccessToken() {
    const accessToken = window.localStorage.getItem("token");
    if (!accessToken) return null;

    return accessToken;
  }

  async getIdInstance() {
    const idToReturn = await fetch(`${this.baseUrl}/getId`, {
      method: "GET",
    });

    return idToReturn;
  }

  async authedHeaders() {
    const accessToken = await Api.getAccessToken();
    if (!accessToken) return this.baseHeaders;
    return {
      ...this.baseHeaders,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async authFetch(path, { method, body, headers } = { method: "GET" }) {
    const authedHeaders = await this.authedHeaders();
    return fetch(this.baseUrl + path, {
      method,
      headers: { ...authedHeaders, ...headers },
      ...(body && { body: JSON.stringify(body) }),
    });
  }
}

export default new Api(process.env.REACT_APP_API_URL);
