import { exec, execSync } from 'child_process';
import { platform } from 'os';
import chalk from 'chalk';

const yellow = (...args) => console.log(chalk.yellow(...args));
const green = (...args) => console.log(chalk.green(...args));
const red = (...args) => console.log(chalk.red(...args));

export async function checkBunInstallation() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
  } catch {
    await installBun();
  }
}

function installBun() {
  return new Promise((resolve, reject) => {
    const os = platform();

    if (os === 'win32') {
      yellow('Installing bun on Windows...');
      exec('powershell -c "irm bun.sh/install.ps1|iex"', (error, stdout) => {
        if (error) {
          red('Failed to install bun:', error);
          reject(1);
          return;
        }
        green('Bun installed successfully:', stdout);
        resolve(0);
      });
    } else if (os === 'linux' || os === 'darwin') {
      yellow('Installing bun on Linux or macOS...');
      exec('curl -fsSL https://bun.sh/install | bash', (error, stdout) => {
        if (error) {
          red('Failed to install bun:', error);
          reject(1);
          return;
        }
        green('Bun installed successfully:', stdout);
        resolve(0);
      });
    } else {
      red('Please install bun manually: https://bun.sh');
      reject(1);
    }
  });
}
