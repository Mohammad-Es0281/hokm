import { Injectable } from '@nestjs/common';
import { TIMER_TICK_INTERVAL } from '../game/types/constants';

export interface TimerCallback {
    onTick: (remaining: number) => void;
    onTimeout: () => void;
}

@Injectable()
export class TimerService {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private timeRemaining: Map<string, number> = new Map();

    /**
     * Start a timer for a specific entity (room, player, etc.)
     */
    startTimer(
        id: string,
        duration: number,
        callbacks: TimerCallback
    ): void {
        // Clear existing timer if any
        this.clearTimer(id);

        this.timeRemaining.set(id, duration);

        const interval = setInterval(() => {
            const remaining = this.timeRemaining.get(id);

            if (remaining === undefined || remaining <= 0) {
                this.clearTimer(id);
                callbacks.onTimeout();
                return;
            }

            const newRemaining = remaining - 1;
            this.timeRemaining.set(id, newRemaining);
            callbacks.onTick(newRemaining);

            if (newRemaining <= 0) {
                this.clearTimer(id);
                callbacks.onTimeout();
            }
        }, TIMER_TICK_INTERVAL);

        this.timers.set(id, interval);
    }

    /**
     * Clear a timer
     */
    clearTimer(id: string): void {
        const timer = this.timers.get(id);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(id);
            this.timeRemaining.delete(id);
        }
    }

    /**
     * Get remaining time for a timer
     */
    getTimeRemaining(id: string): number {
        return this.timeRemaining.get(id) || 0;
    }

    /**
     * Check if a timer exists
     */
    hasTimer(id: string): boolean {
        return this.timers.has(id);
    }

    /**
     * Clear all timers
     */
    clearAll(): void {
        this.timers.forEach((timer) => clearInterval(timer));
        this.timers.clear();
        this.timeRemaining.clear();
    }
}
