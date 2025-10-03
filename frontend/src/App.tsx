import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { apiService } from './services/api.service';
import { Lobby } from './pages/Lobby/Lobby';
import { CreateRoom } from './pages/CreateRoom/CreateRoom';
import { GameRoom } from './pages/GameRoom/GameRoom';
import { Replay } from './pages/Replay/Replay';
import { strings } from './utils/i18n';

const App: React.FC = () => {
    const { user, initData, isReady } = useTelegram();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const authenticate = async () => {
            if (!isReady) return;

            try {
                if (initData) {
                    // Authenticate with Telegram
                    const response = await apiService.authenticateTelegram(initData);
                    localStorage.setItem('authToken', response.token);
                    setUserId(response.user.telegramId);
                    setIsAuthenticated(true);
                } else {
                    // Development mode fallback
                    console.warn('Running in development mode without Telegram');
                    setUserId('dev_user_' + Date.now());
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Authentication failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        authenticate();
    }, [isReady, initData]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: '#ffffff',
            }}>
                {strings.loading}
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: '#ffffff',
            }}>
                {strings.error}
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Lobby userId={userId} />} />
                <Route path="/create" element={<CreateRoom userId={userId} />} />
                <Route path="/room/:roomId" element={<GameRoom userId={userId} />} />
                <Route path="/replay/:matchId" element={<Replay />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;