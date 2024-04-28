import { createServer } from 'node:net';

const checkPort = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(port);
      });
      server.close();
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(checkPort(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

export const findAvailablePort = async (startPort: number): Promise<number> => {
  try {
    const availablePort = await checkPort(startPort);
    return availablePort;
  } catch (error) {
    throw error;
  }
};
