import * as crypto from 'crypto';

export class TelegramConfig {
    static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    /**
     * Validate Telegram Web App initData
     * @param initData - The initData string from Telegram Web App
     * @returns boolean - Whether the data is valid
     */
    static validateInitData(initData: string): boolean {
        if (!this.BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        if (!hash) {
            return false;
        }

        // Create data check string
        const dataCheckArr = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`);

        const dataCheckString = dataCheckArr.join('\n');

        // Create secret key
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(this.BOT_TOKEN)
            .digest();

        // Calculate hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        return calculatedHash === hash;
    }

    /**
     * Parse user data from initData
     */
    static parseInitData(initData: string): any {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');

        if (!userParam) {
            return null;
        }

        try {
            return JSON.parse(userParam);
        } catch {
            return null;
        }
    }
}