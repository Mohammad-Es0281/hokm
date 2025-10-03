import { useEffect, useState } from 'react';
import { telegramService } from '../services/telegram.service';
import { TelegramUser } from '../types/telegram.types';

export const useTelegram = () => {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        telegramService.init();

        const tgUser = telegramService.user;
        if (tgUser) {
            setUser(tgUser);
        }

        setIsReady(true);
    }, []);

    return {
        user,
        isReady,
        webApp: telegramService.webApp,
        initData: telegramService.initData,
        colorScheme: telegramService.colorScheme,
        themeParams: telegramService.themeParams,
        showBackButton: telegramService.showBackButton.bind(telegramService),
        hideBackButton: telegramService.hideBackButton.bind(telegramService),
        showMainButton: telegramService.showMainButton.bind(telegramService),
        hideMainButton: telegramService.hideMainButton.bind(telegramService),
        hapticFeedback: telegramService.hapticFeedback.bind(telegramService),
        showAlert: telegramService.showAlert.bind(telegramService),
        showConfirm: telegramService.showConfirm.bind(telegramService),
        close: telegramService.close.bind(telegramService),
        isAvailable: telegramService.isAvailable(),
    };
};