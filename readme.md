<div align="center">

# 🎮 Discord Rich Presence for Acode

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/overskul/acode-discordrpc)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Acode](https://img.shields.io/badge/Acode-%3E%3D958-orange.svg)](https://acode.app)
[![Discord](https://img.shields.io/badge/Discord-Integration-5865F2.svg?logo=discord&logoColor=white)](https://discord.com)

**Show off your coding activity on Discord in real-time!** ✨

Display what you're working on, which file you're editing, and your current workspace directly in your Discord status.

---

</div>

## 🚨 CRITICAL SECURITY WARNINGS

<table>
<tr>
<td>

### ⚠️ TOKEN SECURITY RISK

**YOUR DISCORD TOKEN IS STORED IN PLAIN TEXT!**

- ❌ **ANY plugin** installed in Acode can access your token
- ❌ Token is stored **WITHOUT encryption** in Acode settings
- ❌ Token provides **FULL ACCESS** to your Discord account
- ❌ If compromised, attackers can read messages, send as you, access private servers

**USE AT YOUR OWN RISK!** Consider using a separate Discord account for development.

</td>
</tr>
<tr>
<td>

### 🔴 DISCORD TOS VIOLATION WARNING

**THIS PLUGIN VIOLATES DISCORD'S TERMS OF SERVICE!**

- ❌ Using user account tokens for automation is **AGAINST Discord TOS**
- ❌ This is considered a **"self-bot"** by Discord
- ❌ **YOUR ACCOUNT MAY BE BANNED OR SUSPENDED**
- ❌ Discord actively detects and punishes self-bot usage

**Official Discord Statement:** *"Automating normal user accounts (generally called 'self-bots') outside of the OAuth2/bot API is forbidden."*

**By using this plugin, you accept full responsibility for any account actions taken by Discord.**

</td>
</tr>
</table>

## 📋 Table of Contents

- [Security Warnings](#-critical-security-warnings)
- [Features](#-features)
- [Installation](#-installation)
- [Settings](#-settings)
- [Development](#-development)
- [License](#-license)

## ✨ Features

- 🔄 **Real-time Status Updates** - Automatically updates Discord presence when switching/saving files
- 📁 **Workspace Display** - Shows current project/workspace name
- 📄 **File Information** - Displays the file you're currently editing
- 🎨 **Language Icons** - Beautiful language-specific icons for your current file type
- 🌙 **AFK Mode** - Toggle AFK status manually
- 🔌 **Auto-reconnection** - Automatically reconnects if connection drops (max 10 attempts)
- ⚙️ **Highly Configurable** - Customize what information you want to share
- 📱 **Mobile Support** - Works seamlessly on Android devices

## 📥 Installation

### Prerequisites

- ✅ Acode Editor (version **958** or higher)
- ⚠️ Discord account token *(see security warnings above)*

### From Acode Plugin Store (Recommended)

1. Open **Acode Editor**
2. Go to **Settings** → **Plugins**
3. Search for **"Discord Rich Presence"**
4. Click **Install**
5. Configure your token in plugin settings

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/overskul/acode-discordrpc.git
cd acode-discordrpc

# Install dependencies
npm install

# Build the plugin
npm run build

# Install the generated .zip file in Acode
# Go to: Settings → Plugins → Install from ZIP
```

## 🎛️ Settings

Access settings via: **Acode Settings** → **Plugins** → **Discord Rich Presence**

### Available Settings

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| **Discord Account Token** | `text` | Your Discord user account token (⚠️ **REQUIRED**) | `null` |
| **Is AFK** | `checkbox` | Mark yourself as away from keyboard | `false` |
| **Force Offline** | `checkbox` | Force online status when Discord shows offline | `false` |
| **Show Project Name** | `checkbox` | Display workspace/project name in details | `true` |
| **Show File Name** | `checkbox` | Display current file name in state | `true` |
| **Reconnect** | `button` | Manually trigger reconnection attempt | — |

### Setting Details

#### Discord Account Token
- **Required** to connect to Discord Gateway
- ⚠️ Stored in **plain text** in Acode settings
- ⚠️ See [Security Warnings](#-critical-security-warnings)

#### Privacy Controls

**Show Project Name:**
- ✅ Enabled: `Workspace: My Project`
- ❌ Disabled: `In a workspace`

**Show File Name:**
- ✅ Enabled: `Editing on index.js`
- ❌ Disabled: `Editing on a file`

#### Auto-Reconnection Behavior
- Automatically retries connection on failure
- **Max attempts:** 10
- **Delay:** 1s → 1.5s → 2.25s → ... (exponential backoff, max 30s)
- Manual reconnect resets attempt counter

## 🐛 Known Issues & Limitations

- ⚠️ **5-second rate limit** between presence updates (Discord API limitation)
- ⚠️ **Token must be manually entered** (no OAuth2 flow for user tokens)
- ⚠️ **Mobile Discord app** may not show all Rich Presence features

## 🤝 Contributing

Contributions are welcome! Please be aware of the security and TOS concerns.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed
- Consider security implications

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2024 Overskul
```

## ⚖️ Legal Disclaimer

This plugin is provided "AS IS" without warranty of any kind. The developers are not responsible for:
- Discord account suspensions or bans
- Security breaches or token compromise
- Data loss or corruption
- Any other damages or issues arising from use

**USE AT YOUR OWN RISK.** You are solely responsible for compliance with Discord's Terms of Service.

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/overskul/acode-discordrpc/issues)
- **Discussions:** [GitHub Discussions](https://github.com/overskul/acode-discordrpc/discussions)
- **Author:** [@overskul](https://github.com/overskul)

---

<div align="center">

**⚠️ Remember: This violates Discord TOS. Use responsibly and at your own risk. ⚠️**

*If you find this useful despite the risks, consider ⭐ starring the repo!*

*Readme written by AI because I'm too lazy*
</div>
