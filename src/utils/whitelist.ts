import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const whitelistPath = resolve('whitelist.json');

// Interface for whitelist data structure
interface WhitelistData {
    [guildId: string]: string[]; // guildId -> array of userIds
}

// Ensure the file exists
function ensureFile() {
    if (!existsSync(whitelistPath)) {
        writeFileSync(whitelistPath, JSON.stringify({}), 'utf-8');
    }
}

// Load whitelist from file
function loadWhitelist(): WhitelistData {
    ensureFile();
    try {
        const data = readFileSync(whitelistPath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('[whitelist] Error loading whitelist:', e);
        return {};
    }
}

// Save whitelist to file
function saveWhitelist(data: WhitelistData) {
    try {
        writeFileSync(whitelistPath, JSON.stringify(data, null, 4), 'utf-8');
    } catch (e) {
        console.error('[whitelist] Error saving whitelist:', e);
    }
}

/**
 * Add a user to the whitelist for a specific guild
 */
export function add(guildId: string, userId: string): boolean {
    const data = loadWhitelist();
    if (!data[guildId]) {
        data[guildId] = [];
    }

    if (!data[guildId].includes(userId)) {
        data[guildId].push(userId);
        saveWhitelist(data);
        return true;
    }
    return false;
}

/**
 * Remove a user from the whitelist for a specific guild
 */
export function remove(guildId: string, userId: string): boolean {
    const data = loadWhitelist();
    if (!data[guildId]) return false;

    const index = data[guildId].indexOf(userId);
    if (index > -1) {
        data[guildId].splice(index, 1);
        if (data[guildId].length === 0) {
            delete data[guildId];
        }
        saveWhitelist(data);
        return true;
    }
    return false;
}

/**
 * Check if a user is whitelisted in a specific guild
 */
export function isWhitelisted(guildId: string, userId: string): boolean {
    const data = loadWhitelist();
    return data[guildId]?.includes(userId) ?? false;
}

/**
 * Get all whitelisted users for a guild
 */
export function getList(guildId: string): string[] {
    const data = loadWhitelist();
    return data[guildId] || [];
}
