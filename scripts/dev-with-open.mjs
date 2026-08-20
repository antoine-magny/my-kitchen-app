import { spawn, exec } from "node:child_process";
import http from "node:http";

const PORT = process.env.PORT || 3000;
const url = `http://localhost:${PORT}`;
let opened = false;

// Démarrer le serveur Next.js en mode dev
const nextDev = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

function checkAndOpen() {
  if (opened) return;

  http
    .get(url, () => {
      if (!opened) {
        opened = true;
        console.log(`\n🚀 Application prête ! Ouverture de ${url} dans votre navigateur...\n`);
        const startCmd =
          process.platform === "win32"
            ? `start ${url}`
            : process.platform === "darwin"
              ? `open ${url}`
              : `xdg-open ${url}`;
        exec(startCmd);
      }
    })
    .on("error", () => {
      if (!opened) {
        setTimeout(checkAndOpen, 500);
      }
    });
}

// Commencer la vérification du serveur
setTimeout(checkAndOpen, 1000);

// Gestion de la fermeture propre
process.on("SIGINT", () => {
  nextDev.kill("SIGINT");
  process.exit();
});

process.on("SIGTERM", () => {
  nextDev.kill("SIGTERM");
  process.exit();
});
