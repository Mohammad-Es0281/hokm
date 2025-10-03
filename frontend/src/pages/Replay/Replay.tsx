import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { useTelegram } from '../../hooks/useTelegram';
import { strings } from '../../utils/i18n';
import './Replay.css';

export const Replay: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { showBackButton, hideBackButton } = useTelegram();
    const [replay, setReplay] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        showBackButton(() => navigate('/'));
        return () => hideBackButton();
    }, [showBackButton, hideBackButton, navigate]);

    useEffect(() => {
        const loadReplay = async () => {
            if (!matchId) return;

            try {
                const data = await apiService.getMatchReplay(matchId);
                setReplay(data);
            } catch (err) {
                setError(strings.error);
                console.error('Failed to load replay:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadReplay();
    }, [matchId]);

    if (isLoading) {
        return (
            <div className="replay-loading">
                <div className="loading-spinner" />
                <p>{strings.loading}</p>
            </div>
        );
    }

    if (error || !replay) {
        return (
            <div className="replay-error">
                <p>{error || strings.error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    {strings.back}
                </button>
            </div>
        );
    }

    return (
        <div className="replay">
            <div className="replay-container">
                <h1 className="replay-title">{strings.replay}</h1>

                <div className="replay-info">
                    <div className="info-item">
                        <span className="info-label">وضعیت:</span>
                        <span className="info-value">{replay.status}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">تاریخ:</span>
                        <span className="info-value">
              {new Date(replay.startedAt).toLocaleDateString('fa-IR')}
            </span>
                    </div>
                    {replay.winnerId && (
                        <div className="info-item">
                            <span className="info-label">برنده:</span>
                            <span className="info-value winner">{replay.winnerId}</span>
                        </div>
                    )}
                </div>

                <div className="hands-list">
                    <h2>دست‌های بازی</h2>
                    {replay.hands.map((hand: any, index: number) => (
                        <div key={hand.handId} className="hand-card">
                            <div className="hand-header">
                                <span className="hand-number">دست {hand.handNumber}</span>
                                <span className="hand-trump">
                  حکم: {hand.trumpSuit}
                </span>
                            </div>

                            <div className="hand-scores">
                                {Object.entries(hand.scores).map(([key, score]) => (
                                    <div key={key} className="score-item">
                                        <span>{key}:</span>
                                        <span>{score as number} تک</span>
                                    </div>
                                ))}
                            </div>

                            {hand.isKot && (
                                <div className="kot-badge">
                                    {strings.kot}
                                </div>
                            )}

                            <div className="tricks-count">
                                {hand.tricks.length} تک بازی شد
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};