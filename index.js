const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔗 Git repo and folder path
const REPO = 'https://github.com/Tennor-modz/botfile.git';
const DIR = path.join(__dirname, 'botfile-main');

const git = simpleGit();

// 🧹 Clean old bot files if they exist
if (fs.existsSync(DIR)) {
  console.log('🧹 Removing old bot...');
  fs.rmSync(DIR, { recursive: true, force: true });
}

// 📥 Clone repository safely
(async () => {
  try {
    console.log('📥 Cloning latest bot...');
    await git.clone(REPO, DIR, ['--depth', '1']);

    // 🧩 Install dependencies if needed
    const pkgPath = path.join(DIR, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {});
      const missing = deps.filter(dep => {
        try {
          require.resolve(dep);
          return false;
        } catch {
          return true;
        }
      });

      if (missing.length > 0) {
        console.log(`📦 Installing missing deps: ${missing.join(', ')}`);
        execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
      } else {
        console.log('✅ All dependencies already present.');
      }
    } else {
      console.warn('⚠️ No package.json found in cloned repo.');
    }

    console.log('🚀 Starting bot...');
    require(path.join(DIR, 'index.js'));
  } catch (err) {
    console.error('❌ Error while cloning or starting the bot:', err);
  }
})();

// 🌐 Express server (for uptime)
app.get('/', (req, res) => res.send('🤖 Bot is running!'));

app.listen(PORT, () => {
  console.log(`🌐 Express server running at http://localhost:${PORT}`);
});
