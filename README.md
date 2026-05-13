<div align="center">
  <img src="assets/opencraft-white.png" alt="OpenCraft" width="400">
  <br />
  <br />
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![GitHub stars](https://img.shields.io/github/stars/hariharen9/OpenCraft?style=social)](https://github.com/hariharen9/OpenCraft)
  [![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)

  <p align="center">
    <strong>The note-taking app for those who just want to think.</strong>
    <br />
    Beautiful. Local-first. Unapologetically simple.
  </p>
</div>

---

## 💎 The "Why" behind OpenCraft

I was frustrated with the current state of note-taking. 

**Notion** became a slow database. **Craft** moved everything behind a paywall and filled it with AI I didn't ask for. **Apple Notes** is reliable but lacks the "soul" and formatting power a writer needs. **Obsidian** is powerful, but it requires a PhD in configuration just to make it look decent.

I didn't want a "second brain" that required its own maintenance schedule. I wanted a **focused writing space** that felt as premium as a high-end notebook but as fast as a text file.

So, I built **OpenCraft**.

---

## ✨ Features at a Glance

| Feature | Description |
| :--- | :--- |
| **💻 Native Desktop** | First-class Windows & Mac apps with a custom, borderless brutalist UI. |
| **📂 True Local Files** | On desktop, your notes are saved as real `.md` and `.json` files. |
| **🚀 Instant Search** | Full-text universal search across all documents with `⌘/Ctrl K`. |
| **🖌️ Block Editor** | A rich, fluid writing experience with support for slash commands. |
| **📅 Task Central** | Native OS Notifications, recurring tasks, and calendar sync. |
| **⚡ Global Shortcuts** | Summon your Command Palette from anywhere with `Ctrl+Shift+O`. |

---

## 🎨 How it’s better

### 1. Design as a First-Class Citizen
Most open-source tools look like they were designed by engineers for engineers. OpenCraft is different. Every pixel, every animation, and every hover effect is tuned to create a **flow state**. If a tool isn't a joy to open, you won't use it.

### 2. Your Data, Your Home
OpenCraft is strictly **local-first**. Your notes aren't sitting on someone else's server waiting to be scanned by an AI model. 
- **On the Web**, everything lives safely within your browser's IndexedDB.
- **On Desktop**, your notes are saved directly to your `Documents/OpenCraft` folder as portable `.md` (Markdown) and `.json` files. You can open them in any text editor.

### 3. The "No-AI" Promise
We believe writing is thinking. Automating it defeats the purpose. OpenCraft has no AI features. No "Write it for me." No "Summarize." Just you and the cursor.

---

## 🛠️ Tech Stack

Built with a modern, high-performance stack for a seamless experience:

- **Framework**: [TanStack Start](https://tanstack.com/start) / React 19
- **Desktop Engine**: [Electron](https://www.electronjs.org/) (Native IPC, File System, OS Integrations)
- **Editor Core**: [Tiptap](https://tiptap.dev/)
- **Styling**: Vanilla CSS + Tailwind
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: Native File System (Desktop) / IndexedDB (Web)

---

## 🚀 Getting Started

OpenCraft is free, forever. No "Pro" plans. Just download the latest native app from the **[Releases](https://github.com/hariharen9/OpenCraft/releases)** page, or run it yourself!

```bash
# Clone the repository
git clone https://github.com/hariharen9/OpenCraft

# Install dependencies
npm install

# Start the Web App
npm run dev

# Start the Native Desktop App
npm run dev:desktop

# Build the desktop executables
npm run build:desktop
```

---

<div align="center">
  <p><em>Built by <a href="https://hariharen.site">Hariharen</a> because the tools we loved didn't love us back.</em></p>
  <p>
    <a href="https://github.com/hariharen9/OpenCraft/issues">Report Bug</a> ·
    <a href="https://github.com/hariharen9/OpenCraft/issues">Request Feature</a>
  </p>
</div>
