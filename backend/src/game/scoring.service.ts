import { Injectable } from '@nestjs/common';
import { GameMode } from './types/game.types';
import { TRICKS_TO_WIN } from './types/constants';

export interface HandResult {
    winnerId: string;
    winnerScore: number;
    loserScore: number;
    isKot: boolean;
    bonusHands: number;
}

@Injectable()
export class ScoringService {
    /**
     * Calculate hand result
     */
    calculateHandResult(
        scores: Record<string, number>,
        mode: GameMode,
        kotBonus: number
    ): HandResult | null {
        const entries = Object.entries(scores);
        const tricksNeeded = TRICKS_TO_WIN[mode];

        // Find winner
        const winner = entries.find(([_, score]) => score >= tricksNeeded);
        if (!winner) return null;

        const [winnerId, winnerScore] = winner;
        const loserScores = entries.filter(([id]) => id !== winnerId).map(([_, score]) => score);
        const totalLoserScore = loserScores.reduce((sum, score) => sum + score, 0);

        // Check for Kot (7-0 in team games)
        const isKot = winnerScore === tricksNeeded && totalLoserScore === 0;
        const bonusHands = isKot ? kotBonus : 0;

        return {
            winnerId,
            winnerScore,
            loserScore: totalLoserScore,
            isKot,
            bonusHands,
        };
    }

    /**
     * Apply hand result to match score
     */
    applyHandResult(
        matchScore: Record<string, number>,
        result: HandResult
    ): Record<string, number> {
        const newScore = { ...matchScore };

        // Add 1 for winning the hand
        newScore[result.winnerId] = (newScore[result.winnerId] || 0) + 1;

        // Add bonus for Kot
        if (result.isKot && result.bonusHands > 0) {
            newScore[result.winnerId] += result.bonusHands;
        }

        return newScore;
    }

    /**
     * Check if match is complete
     */
    isMatchComplete(
        matchScore: Record<string, number>,
        targetHands: number
    ): { complete: boolean; winnerId?: string } {
        const entries = Object.entries(matchScore);
        const winner = entries.find(([_, score]) => score >= targetHands);

        if (winner) {
            return { complete: true, winnerId: winner[0] };
        }

        return { complete: false };
    }

    /**
     * Get leaderboard from match score
     */
    getLeaderboard(matchScore: Record<string, number>): Array<{ id: string; score: number }> {
        return Object.entries(matchScore)
            .map(([id, score]) => ({ id, score }))
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate player statistics
     */
    calculatePlayerStats(
        playerId: string,
        matches: Array<{
            winnerId: string;
            playerIds: string[];
            handsWon: Record<string, number>;
            tricksWon: Record<string, number>;
        }>
    ): {
        gamesPlayed: number;
        gamesWon: number;
        handsWon: number;
        tricksWon: number;
        winRate: number;
    } {
        const gamesPlayed = matches.filter(m => m.playerIds.includes(playerId)).length;
        const gamesWon = matches.filter(m => m.winnerId === playerId).length;
        const handsWon = matches.reduce((sum, m) => sum + (m.handsWon[playerId] || 0), 0);
        const tricksWon = matches.reduce((sum, m) => sum + (m.tricksWon[playerId] || 0), 0);
        const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

        return {
            gamesPlayed,
            gamesWon,
            handsWon,
            tricksWon,
            winRate,
        };
    }
}