import { promises as fs } from 'fs';

export async function getApiKey() {
  try {
    const configFile = process.env.HOME + '/.pupa/config.json';
    const config = JSON.parse(await fs.readFile(configFile, 'utf-8'));
    return config.token;
  } catch (error) {
    console.error('Failed to get API key:', error);
  }
}