import { RPCWebSocket } from "./WebSocket.js";
import { Presence } from "./Presence.js";

const appSettings = acode.require("settings");
export const APPLICATION_ID = "1221582237603201144";

export class DiscordRichPresence {
  #plugin;
  #lastUpdate = 0;
  #updatePresence;
  static UPDATE_EVENTS = ["switch-file", "save-file"];
  

  constructor(plugin) {
    this.#plugin = plugin;
    if (!appSettings.value[this.#plugin.id]) {
      appSettings.value[this.#plugin.id] = {
        presence: {
          isAFK: false
        },
        config: {
          token: null,
          forceOffline: false,
          showProjectName: true,
          showFileName: true,
        }
      };
    }

    this.presence = new Presence(this);
    this.ws = new RPCWebSocket(this);
    this.#updatePresence = this.updatePresence.bind(this);
  }

  get settings() {
    return appSettings.value[this.#plugin.id];
  }

  async init(baseUrl, $page, { cacheFileUrl, cacheFile, firstInit }) {
    console.log("[D-RPC] • Initializing plugin");

    if (this.settings.config.token) {
      console.log("[D-RPC] • Token found, starting connection");
    } else {
      console.log("[D-RPC] ! No token configured");
    }

    for (const event of DiscordRichPresence.UPDATE_EVENTS) {
      editorManager.on(event, this.#updatePresence);
    }

    setTimeout(() => this.updatePresence(), 2000);
  }

  async destroy() {
    console.log("[D-RPC] • Destroying plugin");
    for (const event of DiscordRichPresence.UPDATE_EVENTS) {
      editorManager.off(event, this.#updatePresence);
    }

    this.ws.close(true);

    if (!appSettings.value.pluginsDisabled[this.#plugin.id]) {
      delete appSettings.value[this.#plugin.id];
      appSettings.update(false);
    }
  }

  async updatePresence() {
    const now = Date.now();
    if (now - this.#lastUpdate < 5000) return;
    this.#lastUpdate = now;

    try {
      await this.ws.updatePresence();
    } catch (error) {
      console.error("[D-RPC] × Failed to update presence:", error);
    }
  }

  get pSettings() {
    return {
      list: [
        // presence
        {
          key: "is_afk",
          text: "Is AFK",
          checkbox: this.settings.presence.isAFK
        },
        // config
        {
          key: "token",
          text: "Discord Account Token",
          info: "Required for Discord Rich Presence to work",
          prompt: "Enter your Discord token",
          promptType: "text",
          promptOptions: {
            required: true,
            placeholder: "MTIyMTU4MjIzNzYwMzIwMTE0NA..."
          }
        },
        {
          key: "force_offline",
          text: "Force offline",
          info: "force if discord offline to online status",
          checkbox: this.settings.config.forceOffline
        },
        {
          key: "show_project_name",
          text: "Show project name",
          info: "If [true] will show 'Workspace: {name}' and if [false] will show 'In a workspace'",
          checkbox: this.settings.config.showProjectName
        },
        // {
        //   key: "show_repository_name",
        //   text: "Show repository name",
        //   checkbox: this.settings.config.showRepositoryName
        // },
        {
          key: "show_file_name",
          text: "Show file name",
          info: "If [true] will show 'Editing on {name}' and if [false] will show 'Editing on a file'",
          checkbox: this.settings.config.showFileName
        },
        // {
        //   key: "show_curser_position",
        //   text: "Show curser position",
        //   checkbox: this.settings.config.showCurserPosition
        // },
        // {
        //   key: "show_repository_button",
        //   text: "Show repository button",
        //   checkbox: this.settings.config.showRepositoryButton
        // },
        // utility 
        {
          key: "reconnect",
          text: "Reconnect",
        }
      ],
      cb: async (key, value) => {
        switch(key) {
          // presence
          case 'is_afk':
            this.settings.presence.isAFK = !this.settings.presence.isAFK;
            break;

          // config
          case 'token':
            this.settings.config.token = value.trim();
            this.ws.reconnect();
            break;
          case 'force_offline':
            this.settings.config.forceOffline = !this.settings.config.forceOffline;
            break;
          case 'show_project_name':
            this.settings.config.showProjectName = !this.settings.config.showProjectName;
            break;
          // case 'show_repository_name':
          //   this.settings.config.showRepositoryName = !this.settings.config.showRepositoryName;
          //   break;
          case 'show_file_name':
            this.settings.config.showFileName = !this.settings.config.showFileName;
            break;
          // case 'show_curser_position':
          //   this.settings.config.showCurserPosition = !this.settings.config.showCurserPosition;
          //   break;
          // case 'show_repository_button':
          //   this.settings.config.showRepositoryButton = !this.settings.config.showRepositoryButton;
          //   break;

          // utility 
          case 'reconnect':
            this.ws.reconnect();
            break;
        }

        appSettings.update(false);
        await this.ws.updatePresence();
      }
    };
  }
}
