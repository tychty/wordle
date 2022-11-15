import useGame, { MAX_GUESSES, TGuess, WORD_LENGTH } from './useGame';
import './App.css';
import { useEffect, useMemo, useState } from 'react';

type TOGuess = Array<Pick<TGuess[0], 'value'> & Partial<Omit<TGuess[0], 'value'>>>;

const Line = ({ guess }: { guess?: TGuess | string | undefined }) => {

  const line = useMemo<TOGuess>(() => {
    const _guess = guess || '';
    const res: TOGuess = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = _guess[i] || '';
      res[i] = typeof letter === 'string' ? { value: letter } : letter;
    }
    return res;
  }, [guess]);

  return (<div className="line">
    {line.map((letter, j) => (
      <div className={`letter${letter.status ? ' ' + letter.status : ''}`} key={letter.value + j}>
        {letter.value.toUpperCase()}
      </div>
    ))}
  </div>);
}

const App = () => {

  const {
    guesses,
    gameOver,
    startNewGame,
    checkGuess,
  } = useGame();

  const [gameStatus, setGameStatus] = useState<'won' | 'lost' | undefined>();
  const [current, setCurrent] = useState('');

  const startHandler = startNewGame;

  useEffect(() => {
    if (!gameOver) setGameStatus(undefined);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const handler = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      if (key === 'enter') {
        const resp = checkGuess(current);
        if (resp.status !== 'wrong_word') setCurrent('');
        if (resp.status === 'lost') setGameStatus('lost');
        if (resp.status === 'won') setGameStatus('won');
        return;
      }
      if (key === 'backspace') {
        setCurrent(current => {
          if (current.length <= 0) return current;
          return current.slice(0, -1);
        });
        return;
      }
      if (!/^[a-z]{1}$/.test(key)) return;

      setCurrent(current => {
        if (current.length >= WORD_LENGTH) return current;
        return current + key;
      })
    }

    addEventListener('keydown', handler);

    return () => removeEventListener('keydown', handler);
  }, [checkGuess, gameOver, current]);

  const lines = new Array<TGuess | string | undefined>(MAX_GUESSES).fill(undefined);
  if (gameOver)
    lines.splice(0, guesses.length, ...guesses);
  else
    lines.splice(0, guesses.length + 1, ...guesses, current);

  return (
    <div className={`App${gameStatus ? ' ' + gameStatus : ''}`}>
      <button className="newGame" onClick={startHandler}>Start New Game</button>

      <div className="board">
        {lines.map((guess, i) => (
          <Line key={i} guess={guess} />
        ))}
      </div>
    </div>
  );
}

export default App;
