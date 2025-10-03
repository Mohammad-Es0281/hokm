import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../game/entities/match.entity';
import { Hand } from '../game/entities/hand.entity';
import { Trick } from '../game/entities/trick.entity';
import { PlayedCard } from '../game/entities/played-card.entity';

@Injectable()
export class ReplayService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
        @InjectRepository(Hand)
        private handRepository: Repository<Hand>,
        @InjectRepository(Trick)
        private trickRepository: Repository<Trick>,
        @InjectRepository(PlayedCard)
        private playedCardRepository: Repository<PlayedCard>,
    ) {}

    /**
     * Get match with full history
     */
    async getMatchReplay(matchId: string) {
        const match = await this.matchRepository.findOne({
            where: { id: matchId },
            relations: ['room', 'hands', 'hands.tricks', 'hands.tricks.playedCards'],
        });

        if (!match) {
            throw new NotFoundException('بازی یافت نشد');
        }

        return this.formatMatchForReplay(match);
    }

    /**
     * Get hand replay
     */
    async getHandReplay(handId: string) {
        const hand = await this.handRepository.findOne({
            where: { id: handId },
            relations: ['tricks', 'tricks.playedCards'],
        });

        if (!hand) {
            throw new NotFoundException('دست یافت نشد');
        }

        return this.formatHandForReplay(hand);
    }

    /**
     * Get trick details
     */
    async getTrickDetails(trickId: string) {
        const trick = await this.trickRepository.findOne({
            where: { id: trickId },
            relations: ['playedCards'],
            order: {
                playedCards: {
                    playOrder: 'ASC',
                },
            },
        });

        if (!trick) {
            throw new NotFoundException('تک یافت نشد');
        }

        return {
            trickNumber: trick.trickNumber,
            leadPlayerId: trick.leadPlayerId,
            leadSuit: trick.leadSuit,
            winnerId: trick.winnerId,
            winningCardId: trick.winningCardId,
            playedCards: trick.playedCards.map(card => ({
                playerId: card.playerId,
                suit: card.suit,
                rank: card.rank,
                cardId: card.cardId,
                playOrder: card.playOrder,
                isAutoPlayed: card.isAutoPlayed,
                playedAt: card.playedAt,
            })),
        };
    }

    /**
     * Get player match history
     */
    async getPlayerMatchHistory(userId: string, limit: number = 20) {
        const matches = await this.matchRepository
            .createQueryBuilder('match')
            .where(':userId = ANY(match.playerIds)', { userId })
            .orderBy('match.startedAt', 'DESC')
            .take(limit)
            .getMany();

        return matches.map(match => ({
            id: match.id,
            status: match.status,
            playerIds: match.playerIds,
            matchScore: match.matchScore,
            winnerId: match.winnerId,
            startedAt: match.startedAt,
            completedAt: match.completedAt,
        }));
    }

    /**
     * Format match for replay
     */
    private formatMatchForReplay(match: Match) {
        return {
            matchId: match.id,
            status: match.status,
            playerIds: match.playerIds,
            teams: match.teams,
            matchScore: match.matchScore,
            targetHands: match.targetHands,
            winnerId: match.winnerId,
            startedAt: match.startedAt,
            completedAt: match.completedAt,
            hands: match.hands.map(hand => this.formatHandForReplay(hand)),
        };
    }

    /**
     * Format hand for replay
     */
    private formatHandForReplay(hand: Hand) {
        return {
            handId: hand.id,
            handNumber: hand.handNumber,
            trumpSuit: hand.trumpSuit,
            trumpSelectedBy: hand.trumpSelectedBy,
            leaderId: hand.leaderId,
            initialHands: hand.initialHands,
            scores: hand.scores,
            winnerId: hand.winnerId,
            isKot: hand.isKot,
            startedAt: hand.startedAt,
            completedAt: hand.completedAt,
            tricks: hand.tricks.map(trick => ({
                trickNumber: trick.trickNumber,
                leadPlayerId: trick.leadPlayerId,
                leadSuit: trick.leadSuit,
                winnerId: trick.winnerId,
                playedCards: trick.playedCards
                    .sort((a, b) => a.playOrder - b.playOrder)
                    .map(card => ({
                        playerId: card.playerId,
                        suit: card.suit,
                        rank: card.rank,
                        cardId: card.cardId,
                        isAutoPlayed: card.isAutoPlayed,
                        playedAt: card.playedAt,
                    })),
            })),
        };
    }
}