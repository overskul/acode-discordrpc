import { Presence } from "./Presence.js";

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";

export class RPCWebSocket {
  #ws = null;
  #seq = null;

  #heartbeatInterval = null;
  #reconnectInterval = null;

  #reconnectAttempts = 0;
  #maxReconnectAttempts = 10;

  #reconnectDelay = 1000; // 1s
  #maxReconnectDelay = 30000; // 30s

  #isConnected = false;
  #shouldReconnect = true;

  #connectionTimeout = null;

  userId = null;
  status = "online";

  constructor(rpc) {
    this.rpc = rpc;
    this.presence = rpc.presence;
    this.#connect();
  }

  #connect() {
    if (this.#ws && this.#ws.readyState !== WebSocket.CLOSED && this.#ws.readyState !== WebSocket.CLOSING) {
      console.log("[D-RPC] • Connection already exists");
      return;
    }

    const token = this.rpc.settings.config.token;
    if (!token) {
      console.error("[D-RPC] × No token available, cannot connect");
      this.#scheduleReconnect();
      return;
    }

    console.log("[D-RPC] • Attempting to connect...");
    this.#clearConnectionTimeout();

    try {
      this.#ws = new WebSocket(GATEWAY_URL);
      this.#ws.onopen = this.#onOpen.bind(this);
      this.#ws.onclose = this.#onClose.bind(this);
      this.#ws.onerror = this.#onError.bind(this);
      this.#ws.onmessage = this.#onMessage.bind(this);

      this.#connectionTimeout = setTimeout(() => {
        if (this.#ws && this.#ws.readyState === WebSocket.CONNECTING) {
          console.log("[D-RPC] × Connection timeout");
          this.#ws.close();
        }
      }, 10000); // 10s
    } catch (error) {
      console.error("[D-RPC] × Failed to create WebSocket:", error);
      this.#scheduleReconnect();
    }
  }

  #onOpen() {
    console.log("[D-RPC] ✓ Connected to Discord Gateway");
    this.#clearConnectionTimeout();
    this.#isConnected = true;
    this.#reconnectAttempts = 0;
    this.#reconnectDelay = 1000;
  }

  #onClose(event) {
    console.log("[D-RPC] • Disconnected, code:", event.code, "reason:", event.reason);
    this.#clearConnectionTimeout();
    this.#clearHeartbeat();
    this.#isConnected = false;

    if (this.#shouldReconnect) {
      this.#scheduleReconnect();
    }
  }

  #onError(err) {
    console.error("[D-RPC] × WebSocket Error:", err);
  }

  async #onMessage(event) {
    try {
      const payload = JSON.parse(event.data);
      const { op, s, t, d } = payload;
      if (s !== null) this.#seq = s;

      switch (op) {
        // HELLO
        case 10:
          this.#startHeartbeat(d.heartbeat_interval);
          await this.#identify();
          break;

        // HEARTBEAT ACK
        case 11:
          // Heartbeat acknowledged
          break;

        // INVALID SESSION
        case 9:
          console.log("[D-RPC] ! Invalid session, reconnecting...");
          this.#reconnect();
          break;
      }

      if (!t) return;

      if (t === "READY") {
        this.userId = d.user.id;
        const session = d.sessions?.find(s => s.client_info?.os === "android");
        if (session?.status) this.status = session.status;
        console.log("[D-RPC] ✓ Ready");
        return;
      }

      if (t === "PRESENCE_UPDATE") {
        if (d.user?.id !== this.userId) return;
        const mobileStatus = d.client_status?.mobile;
        if (mobileStatus) this.status = mobileStatus;
      }
    } catch (error) {
      console.error("[D-RPC] × Failed to parse message:", error);
    }
  }

  #startHeartbeat(interval) {
    this.#clearHeartbeat();
    this.#heartbeatInterval = setInterval(() => {
      if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
        this.#ws.send(JSON.stringify({
          op: 1,
          d: this.#seq
        }));
      }
    }, interval);
  }

  #clearHeartbeat() {
    if (this.#heartbeatInterval) {
      clearInterval(this.#heartbeatInterval);
      this.#heartbeatInterval = null;
    }
  }

  #clearConnectionTimeout() {
    if (this.#connectionTimeout) {
      clearTimeout(this.#connectionTimeout);
      this.#connectionTimeout = null;
    }
  }

  #clearReconnect() {
    if (this.#reconnectInterval) {
      clearTimeout(this.#reconnectInterval);
      this.#reconnectInterval = null;
    }
  }

  async #identify() {
    const token = this.rpc.settings.config.token;
    if (!token) {
      console.error("[D-RPC] × Cannot identify: No token");
      this.#ws.close();
      return;
    }

    try {
      const pc = await this.presence.getPresence();
      this.#ws.send(JSON.stringify({
        op: 2,
        d: {
          token: token,
          properties: {
            os: "android",
            browser: "chrome",
            device: "mobile"
          },
          presence: pc,
        }
      }));
    } catch (error) {
      console.error("[D-RPC] × Failed to identify:", error);
      this.#ws.close();
    }
  }

  #scheduleReconnect() {
    this.#clearReconnect();
    
    if (!this.#shouldReconnect || this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      console.log("[D-RPC] • Max reconnection attempts reached or reconnect disabled");
      return;
    }

    this.#reconnectAttempts++;
    const delay = Math.min(this.#reconnectDelay * Math.pow(1.5, this.#reconnectAttempts - 1), this.#maxReconnectDelay);
    
    console.log(`[D-RPC] • Reconnecting in ${delay}ms (attempt ${this.#reconnectAttempts}/${this.#maxReconnectAttempts})`);
    
    this.#reconnectInterval = setTimeout(() => {
      this.#connect();
    }, delay);
  }

  #reconnect() {
    console.log("[D-RPC] • Manual reconnect requested");
    this.#clearReconnect();
    this.#clearHeartbeat();
    this.#clearConnectionTimeout();
    
    if (this.#ws) {
      this.#ws.close();
      this.#ws = null;
    }
    
    this.#reconnectAttempts = 0;
    setTimeout(() => this.#connect(), 1000);
  }

  async updatePresence() {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN || !this.#isConnected) {
      console.log("[D-RPC] • Cannot update presence: WebSocket not ready");
      return;
    }

    try {
      const pc = await this.presence.getPresence();
      this.#ws.send(JSON.stringify({
        op: 3,
        d: pc
      }));
    } catch (error) {
      console.error("[D-RPC] × Failed to update presence:", error);
    }
  }

  close(permanent = false) {
    console.log("[D-RPC] • Closing WebSocket");
    
    this.#shouldReconnect = !permanent;
    this.#isConnected = false;
    
    this.#clearHeartbeat();
    this.#clearReconnect();
    this.#clearConnectionTimeout();
    
    if (this.#ws) {
      if (this.#ws.readyState === WebSocket.OPEN || this.#ws.readyState === WebSocket.CONNECTING) {
        this.#ws.close(1000, "Plugin destroyed");
      }
      this.#ws = null;
    }
    
    this.#seq = null;
  }

  reconnect() {
    this.#reconnect();
  }

  get isConnected() {
    return this.#isConnected && this.#ws && this.#ws.readyState === WebSocket.OPEN;
  }
}