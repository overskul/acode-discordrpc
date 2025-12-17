import Icons from "./Icons.json";
import { APPLICATION_ID } from "./Plugin.js";

const fs = acode.require('fs');
const Url = acode.require('url');

export class Presence {
  constructor(rpc) {
    this.rpc = rpc;
    this.settings = rpc.settings;
  }

  async getPresence() {
    return {
      since: null,
      afk: this.isAFK,
      status: this.status,
      activities: [{
        name: BuildInfo.displayName,
        type: 0,
        application_id: APPLICATION_ID,
        state: this.state,
        details: this.details,
        assets: {
          large_image: Icons["acode"],
          large_text: "Acode Editor",
          small_image: Icons[this.currentLanguage] || Icons["acode"],
          small_text: this.currentLanguage
        }
      }]
    }
  }

  get isAFK() {
    return !!this.settings.presence.isAFK;
  }

  get status() {
    if (
      this.settings.config.forceOffline && 
      this.rpc.ws.status === "offline"
    )
      return "online";
    return this.rpc.ws.status;
  }

  get state() {
    const { activeFile } = editorManager;
    if (activeFile.type === "terminal") return "Using Terminal";
    if (!activeFile.session || activeFile.id === "default-session") return "Idle in editor";
    if (!this.settings.config.showFileName) return "Editing on a file";
    return `Editing on ${activeFile.filename}`;
  }

  get details() {
    const { activeFile } = editorManager;
    if (addedFolder.length === 0) return null;

    const project = addedFolder.find((f) => activeFile?.uri?.startsWith(f?.url));
    if (!project || !project.url) return;
    
    // const repoName = await this.#getRepositoryName(project.url);
    // if (repoName) {
    //   if(!this.settings.config.showRepositoryName) return "In a repository";
    //   return `Repository: ${repoName}`;
    // } else {
      if (!project.title || !this.settings.config.showProjectName) return "In a workspace";
      return `Workspace: ${project.title}`;
    // }

    // return null;
  }

  // async #getRepositoryName(path) {
  //   try {
  //     const url = await this.#getRepositoryURL(path);
  //     if (!url) return;
  //     let repoName = url.split("/").pop();
  //     if (repoName.endsWith(".git")) repoName = repoName.slice(0, -4);
  //     return repoName;
  //   } catch(_) {
  //     return; // ignore errors
  //   }
  // }

  get currentLanguage() {
    const { activeFile } = editorManager;
    if (!activeFile.session) return;
    return activeFile.session?.$mode?.$id?.split("/")?.pop() || "text";
  }

  // async getRepositoryButton() {
  //   try {
  //     const { activeFile } = editorManager;
  //     if (addedFolder.length === 0) return null;

  //     const project = addedFolder.find((f) => activeFile?.uri?.startsWith(f?.url));
  //     if (!project || !project.url) return;

  //     const repoUrl = await this.#getRepositoryURL(project.url);
  //     if (!repoUrl) return;
  //     return {
  //       buttons: ["View Repository"],
  //       metadata: {
  //         button_urls: [repoUrl]
  //       }
  //     };
  //   } catch (_) {
  //     return; // ignore errors
  //   }
  // }
  
  // async #getRepositoryURL(path) {
  //   try {
  //     const gitDir = fs(Url.join(path, ".git"));
  //     if (!(await gitDir.exists())) return;

  //     const gitConfig = fs(Url.join(path, ".git", "config"));
  //     if (!(await gitConfig.exists())) return;

  //     const gitConfigContent = await gitConfig.readFile("utf-8");
  //     const match = gitConfigContent.match(/url\s*=\s*(.+)/);
  //     if (!match) return;

  //     const url = match[1].trim();
  //     return url;
  //   } catch(_) {
  //     return; // ignore errors
  //   }
  // }
}