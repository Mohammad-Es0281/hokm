import { TelegramWebApp } from '../types/telegram.types';

class TelegramService {
    private tg: TelegramWebApp | null = null;

    init(): void {
        if (window.Telegram?.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.ready();
            this.tg.expand();
        }
    }

    get webApp(): TelegramWebApp | null {
        return this.tg;
    }

    get initData(): string {
        return this.tg?.initData || '';
    }

    get user() {
        return this.tg?.initDataUnsafe.user;
    }

    get colorScheme() {
        return this.tg?.colorScheme || 'dark';
    }

    get themeParams() {
        return this.tg?.themeParams || {};
    }

    showBackButton(callback: () => void): void {
        if (this.tg?.BackButton) {
            this.tg.BackButton.show();
            this.tg.BackButton.onClick(callback);
        }
    }

    hideBackButton(): void {
        if (this.tg?.BackButton) {
            this.tg.BackButton.hide();
        }
    }

    showMainButton(text: string, callback: () => void): void {
        if (this.tg?.MainButton) {
            this.tg.MainButton.setText(text);
            this.tg.MainButton.show();
            this.tg.MainButton.onClick(callback);
        }
    }

    hideMainButton(): void {
        if (this.tg?.MainButton) {
            this.tg.MainButton.hide();
        }
    }

    hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'): void {
        if (this.tg?.HapticFeedback) {
            if (type === 'success' || type === 'error' || type === 'warning') {
                this.tg.HapticFeedback.notificationOccurred(type);
            } else {
                this.tg.HapticFeedback.impactOccurred(type);
            }
        }
    }

    showAlert(message: string): void {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message: string, callback: (confirmed: boolean) => void): void {
        if (this.tg) {
            this.tg.showConfirm(message, callback);
        } else {
            const confirmed = confirm(message);
            callback(confirmed);
        }
    }

    close(): void {
        this.tg?.close();
    }

    isAvailable(): boolean {
        return this.tg !== null;
    }
}

export const telegramService = new TelegramService();