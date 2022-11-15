import { useCallback, useMemo, useState } from 'react';
import words from './assets/words.json';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type TGuess = Array<{ value: string, status: 'correct' | 'incorrect' | 'misplaced' }>;

export interface IGame {
    guesses: TGuess[];
    gameOver: boolean;
    startNewGame: () => void;
    checkGuess: (guess: string) => {
        status: 'won' | 'lost' | 'wrong_word',
    } | {
        status: 'try_again',
        guess: TGuess,
    };
}

const useGame = (): IGame => {
    const [answer, setAnswer] = useState<string | undefined>(() => words[Math.floor(Math.random() * words.length)]);
    const [guesses, setGuesses] = useState<TGuess[]>([]);
    const [gameOver, setGameOver] = useState(false);

    const startNewGame = useCallback(() => {
        const newAns = words[Math.floor(Math.random() * words.length)];
        setAnswer(newAns);
        setGuesses([]);
        setGameOver(false);
    }, []);

    const checkGuess = useCallback((guess: string): {
        status: 'won' | 'lost' | 'wrong_word',
    } | {
        status: 'try_again',
        guess: TGuess,
    } => {
        if (guesses.length >= MAX_GUESSES || !answer) {
            throw new Error('Need to restart game');
        }

        if (guess.length !== (answer?.length || 0) || !words.includes(guess) || guesses.some(g => g.map(l => l.value).join('') === guess)) {
            return { status: 'wrong_word' };
        }

        if (guess === answer) {
            setGuesses([...guesses || [], guess.split('').map(char => ({ value: char, status: 'correct' }))]);
            setGameOver(true);
            return { status: 'won' };
        }

        const res: TGuess = [];
        const gue: (string | undefined)[] = guess.split('');
        const ans: (string | undefined)[] = answer!.split('');

        gue.forEach((char, i) => {
            if (char === ans[i]) {
                res[i] = { value: char!, status: 'correct' };
                gue[i] = undefined;
                ans[i] = undefined;
            }
        });

        const ansMap = new Map<string, { current: number }>();
        ans.forEach(char => {
            if (!char) return;

            if (!ansMap.get(char)) {
                ansMap.set(char, { current: 1 });
            } else {
                ansMap.get(char)!.current++;
            }
        })

        const guessMap = new Map<string, { current: number }>();
        gue.forEach((char, i) => {
            if (!char) return;

            const ansMappedValue = ansMap.get(char);
            if (!ansMappedValue) {
                res[i] = { value: char, status: 'incorrect' };
                return;
            }

            const guessMappedValue = guessMap.get(char);
            if (!guessMappedValue) {
                guessMap.set(char, { current: 1 });
            } else {
                if (ansMappedValue.current <= guessMappedValue.current) {
                    res[i] = { value: char, status: 'incorrect' };
                    return;
                }
                guessMappedValue.current++;
            }

            res[i] = { value: char, status: 'misplaced' };
        });

        setGuesses([...guesses || [], res]);

        if (guesses.length >= MAX_GUESSES - 1) {
            setGameOver(true);
            return { status: 'lost' };
        }
        return { status: 'try_again', guess: res };
    }, [answer, guesses]);

    return {
        guesses,
        gameOver,
        startNewGame,
        checkGuess,
    };
}

export default useGame;