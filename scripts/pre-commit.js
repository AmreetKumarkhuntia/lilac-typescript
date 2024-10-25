import { exec } from 'child_process';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  brightGreen: '\x1b[1;32m', // Bright Green for success messages
  brightRed: '\x1b[1;31m', // Bright Red for error messages
  brightYellow: '\x1b[1;33m', // Bright Yellow for warnings and separators
  brightCyan: '\x1b[1;36m', // Bright Cyan for command execution indication
};

/**
 * Executes a shell command.
 * @param {string} command - The command to execute.
 * @returns {Promise<void>} - A promise that resolves when the command has finished executing.
 */
async function executeCommand(command) {
  console.log(
    `${colors.brightCyan}Executing command: ${command}${colors.reset}`
  );
  console.log(
    `${colors.brightYellow}-------------------------------------------------${colors.reset}`
  );

  try {
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `${colors.brightRed}Error executing command: ${error.message}${colors.reset}`
          );
          return reject(error);
        }
        if (stderr) {
          console.error(`${colors.brightRed}stderr: ${stderr}${colors.reset}`);
          return reject(new Error(stderr));
        }
        console.log(`${stdout}`);
        resolve();
      });
    });
    console.log(
      `${colors.brightGreen}Command executed successfully.${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.brightRed}Command execution failed: ${error.message}${colors.reset}`
    );
  }
}

// Example usage:
executeCommand('npm run format');
