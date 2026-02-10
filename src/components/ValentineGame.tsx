"use client";

import { useState, useCallback, useRef } from "react";
import Celebration from "./Celebration";
import YouTubeAudio from "./YouTubeAudio";

type Stage =
  | "quiz"
  | "math"
  | "birthday"
  | "valentine"
  | "angry"
  | "vapeAngry"
  | "celebration";

interface QuizQuestion {
  question: string;
  correct: string;
  options: string[];
  special?: "vape";
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question:
      "If our car was on fire and you could save ONLY one... who do you save? 🔥🚗",
    correct: "Yourself (i aint a bitch)",
    options: [
      "Yourself (i aint a bitch)",
      "Your vape",
      "The car keys",
      "The aux cord",
    ],
    special: "vape",
  },
  {
    question: "Where was our first meeting place? 🤔",
    correct: "Bakery House",
    options: ["Bakery House", "Nofleeyen", "Dubai Mall", "Mars"],
  },
  {
    question: "When is my birthday? 🎂",
    correct: "June 28th, 1999",
    options: [
      "June 28th, 1999",
      "July 15th, 1999",
      "March 3rd, 2000",
      "December 12th, 1998",
    ],
  },
  {
    question: "Do you remember my favourite genre? 🎵",
    correct: "Really shitty fucking music",
    options: ["Really shitty fucking music", "Jazz", "Classical", "Country"],
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffleArray<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const BG_HEARTS = Array.from({ length: 20 }, (_, i) => {
  const layer = i % 3;
  const sizeBase = layer === 0 ? 12 : layer === 1 ? 18 : 26;
  const speedBase = layer === 0 ? 10 : layer === 1 ? 7 : 5;
  return {
    left: `${(5 + i * 4.8) % 100}%`,
    animationDuration: `${speedBase + (i * 1.3) % 5}s`,
    animationDelay: `${(i * 0.7) % 6}s`,
    fontSize: `${sizeBase + (i * 2.1) % 12}px`,
    emoji: ["❤️", "💕", "💖", "💗"][i % 4],
    layerClass: `bg-heart bg-heart-layer-${layer + 1}`,
  };
});

const SONGS = [
  { id: "X_uoq5xCaFc", title: "Song 1 🎵" },
  { id: "Iy-dJwHVX84", title: "Song 2 🎶" },
  { id: "p-Z3YrHJ1sU", title: "Song 3 💕" },
  { id: "yK0l88z879A", title: "Song 4 🎵" },
];

const STAGE_ANIM: Record<string, string> = {
  quiz: "stage-slide-up",
  math: "stage-flip-in",
  birthday: "stage-zoom-in",
  valentine: "stage-zoom-in",
  angry: "stage-slide-up",
  vapeAngry: "stage-slide-up",
  celebration: "stage-zoom-in",
};

export default function ValentineGame() {
  const [stage, setStage] = useState<Stage>("quiz");
  const [quizIndex, setQuizIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() =>
    seededShuffleArray(QUIZ_QUESTIONS[0].options, 28061999)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathError, setMathError] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState({ day: "", month: "", year: "" });
  const [birthdayError, setBirthdayError] = useState(false);
  const [noClickCount, setNoClickCount] = useState(0);
  const [showWrongQuiz, setShowWrongQuiz] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
  }, []);

  // Math question
  const mathA = 14;
  const mathB = 2;
  const mathCorrect = 16;

  const handleQuizAnswer = (answer: string) => {
    const q = QUIZ_QUESTIONS[quizIndex];

    if (q.special === "vape" && answer === "Your vape") {
      setStage("vapeAngry");
      return;
    }

    setSelectedAnswer(answer);
    const correct = answer === q.correct;
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowWrongQuiz(false);
        if (quizIndex < QUIZ_QUESTIONS.length - 1) {
          const nextIndex = quizIndex + 1;
          setQuizIndex(nextIndex);
          setShuffledOptions(shuffleArray(QUIZ_QUESTIONS[nextIndex].options));
        } else {
          setStage("math");
        }
      }, 1200);
    } else {
      setShowWrongQuiz(true);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowWrongQuiz(false);
        setShuffledOptions(shuffleArray(QUIZ_QUESTIONS[quizIndex].options));
      }, 1500);
    }
  };

  const handleMathSubmit = () => {
    if (parseInt(mathAnswer) === mathCorrect) {
      setMathError(false);
      setStage("birthday");
    } else {
      setMathError(true);
      setTimeout(() => setMathError(false), 1500);
    }
  };

  const handleBirthdaySubmit = () => {
    const d = parseInt(birthdayInput.day);
    const m = parseInt(birthdayInput.month);
    const y = parseInt(birthdayInput.year);
    if (d === 4 && m === 11 && y === 2002) {
      setBirthdayError(false);
      setStage("valentine");
    } else {
      setBirthdayError(true);
      setTimeout(() => setBirthdayError(false), 1500);
    }
  };

  const handleYes = () => {
    setStage("celebration");
  };

  const handleNo = () => {
    setNoClickCount((c) => c + 1);
    setStage("angry");
  };

  const currentQ = QUIZ_QUESTIONS[quizIndex];

  return (
    <div className="game-wrapper">
      <div className="music-player-fixed">
        <YouTubeAudio videoId="NyTkaQHdySM" autoPlay loop startPlaying />
      </div>
      {/* Background floating hearts (subtle) */}
      <div className="game-bg-hearts">
        {BG_HEARTS.map((h, i) => (
          <span
            key={i}
            className={h.layerClass}
            style={{
              left: h.left,
              animationDuration: h.animationDuration,
              animationDelay: h.animationDelay,
              fontSize: h.fontSize,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      <div
        ref={cardRef}
        className={`game-card game-card-parallax game-fade-in ${STAGE_ANIM[stage] || ""}`}
        key={`${stage}-${quizIndex}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ─── QUIZ STAGE ─── */}
        {stage === "quiz" && (
          <div className="game-stage">
            <div className="game-progress">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`progress-dot ${i < quizIndex ? "done" : ""} ${i === quizIndex ? "active" : ""}`}
                />
              ))}
              <div className={`progress-dot ${stage !== "quiz" ? "done" : ""}`} />
              <div className="progress-dot" />
            </div>

            <p className="game-step-label">Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</p>
            <h2 className="game-question">{currentQ.question}</h2>

            <div className="game-options">
              {shuffledOptions.map((opt) => {
                let cls = "game-option";
                if (selectedAnswer === opt) {
                  cls += isCorrect ? " correct" : " wrong";
                }
                return (
                  <button
                    key={opt}
                    className={cls}
                    onClick={() => !selectedAnswer && handleQuizAnswer(opt)}
                    disabled={!!selectedAnswer}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showWrongQuiz && (
              <p className="game-error-msg">Nope! Try again baby 😘</p>
            )}
            {isCorrect && (
              <p className="game-success-msg">That&apos;s right! 🥰</p>
            )}
          </div>
        )}

        {/* ─── MATH STAGE ─── */}
        {stage === "math" && (
          <div className="game-stage">
            <div className="game-progress">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div key={i} className="progress-dot done" />
              ))}
              <div className="progress-dot active" />
              <div className="progress-dot" />
            </div>

            <p className="game-step-label">Quick Math 🧮</p>
            <h2 className="game-question">
              What is {mathA} + {mathB}? 🤓
            </h2>
            <p className="game-subtitle">Prove you&apos;re not a robot... or are you? 🤖</p>

            <div className="game-input-row">
              <input
                type="number"
                className={`game-input ${mathError ? "shake" : ""}`}
                placeholder="Your answer..."
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMathSubmit()}
              />
              <button className="game-btn" onClick={handleMathSubmit}>
                Submit ✨
              </button>
            </div>

            {mathError && (
              <p className="game-error-msg">That&apos;s not it... you sure you&apos;re okay? 😂</p>
            )}
          </div>
        )}

        {/* ─── BIRTHDAY STAGE ─── */}
        {stage === "birthday" && (
          <div className="game-stage">
            <div className="game-progress">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div key={i} className="progress-dot done" />
              ))}
              <div className="progress-dot done" />
              <div className="progress-dot active" />
            </div>

            <p className="game-step-label">🔒 Final Lock</p>
            <h2 className="game-question">Enter your birthday to unlock the surprise 🎁</h2>
            <p className="game-subtitle">Only the real one can open this 💕</p>

            <div className="game-birthday-inputs">
              <div className="game-birthday-field">
                <label>Day</label>
                <input
                  type="number"
                  className={`game-input ${birthdayError ? "shake" : ""}`}
                  placeholder="DD"
                  min={1}
                  max={31}
                  value={birthdayInput.day}
                  onChange={(e) => setBirthdayInput({ ...birthdayInput, day: e.target.value })}
                />
              </div>
              <div className="game-birthday-field">
                <label>Month</label>
                <input
                  type="number"
                  className={`game-input ${birthdayError ? "shake" : ""}`}
                  placeholder="MM"
                  min={1}
                  max={12}
                  value={birthdayInput.month}
                  onChange={(e) => setBirthdayInput({ ...birthdayInput, month: e.target.value })}
                />
              </div>
              <div className="game-birthday-field">
                <label>Year</label>
                <input
                  type="number"
                  className={`game-input ${birthdayError ? "shake" : ""}`}
                  placeholder="YYYY"
                  value={birthdayInput.year}
                  onChange={(e) => setBirthdayInput({ ...birthdayInput, year: e.target.value })}
                />
              </div>
            </div>

            <button className="game-btn mt-6" onClick={handleBirthdaySubmit}>
              Unlock 🔓
            </button>

            {birthdayError && (
              <p className="game-error-msg">That&apos;s not your birthday... nice try imposter 😤</p>
            )}
          </div>
        )}

        {/* ─── VALENTINE QUESTION ─── */}
        {stage === "valentine" && (
          <div className="game-stage valentine-stage">
            <div className="valentine-hearts-bg">
              {["💖", "💕", "💗", "❤️", "💘"].map((e, i) => (
                <span key={i} className="valentine-float-emoji" style={{ animationDelay: `${i * 0.5}s`, left: `${10 + i * 18}%` }}>
                  {e}
                </span>
              ))}
            </div>

            <h2 className="valentine-title">
              Will you be my Valentine<br />forever and ever? 💍❤️
            </h2>
            <p className="valentine-subtitle">This is the moment of truth...</p>

            <div className="valentine-buttons">
              <button className="valentine-yes" onClick={handleYes}>
                YES! 💖
              </button>
              <button className="valentine-no" onClick={handleNo}>
                No 😐
              </button>
            </div>
          </div>
        )}

        {/* ─── ANGRY (No clicked) ─── */}
        {stage === "angry" && (
          <div className="game-stage angry-stage">
            <div className="angry-emoji">😡</div>
            <h2 className="angry-title">
              I thought you meant YES u retard 😤<br />Try again or I WILL TOUCH YOU.
            </h2>
            <p className="angry-subtitle">
              {noClickCount > 1
                ? `You clicked no ${noClickCount} times... what the fuck?! 😤`
                : "Try again... and this time, think carefully you piece of shit 🙄"}
            </p>
            <button
              className="game-btn mt-8"
              onClick={() => setStage("valentine")}
            >
              Let me try again daddy pls 🥺😅
            </button>
          </div>
        )}

        {stage === "vapeAngry" && (
          <div className="game-stage angry-stage">
            <div className="angry-emoji">😡</div>
            <h2 className="angry-title">
              You chose the vape?!
              <br />
              I will mutilate you and fuck your skull.
            </h2>
            <p className="angry-subtitle">
              🖕🖕🖕🖕🖕🖕🖕
              <br />
              Pick again. Correctly or I will make sure you never talk to me again fr.
            </p>
            <button
              className="game-btn mt-8"
              onClick={() => {
                setSelectedAnswer(null);
                setIsCorrect(null);
                setShowWrongQuiz(false);
                setShuffledOptions(shuffleArray(QUIZ_QUESTIONS[quizIndex].options));
                setStage("quiz");
              }}
            >
              Go back 😅
            </button>
          </div>
        )}

        {/* ─── CELEBRATION ─── */}
        {stage === "celebration" && (
          <div className="game-stage celebration-stage">
            <Celebration />
            <div className="celebration-content">
              <h2 className="celebration-title">
                YESSS! 🎉💖🥳
              </h2>
              <p className="celebration-text">
                I knew you&apos;d say yes!<br />
                You&apos;re mine forever and ever, my love 💍❤️🫶🏼
              </p>
              <p className="celebration-text-small">
                Happy Valentine&apos;s Forever, bobo 💕
              </p>
              <div className="celebration-ring">💍</div>

              <div className="jukebox">
                <p className="jukebox-label">Our Songs 🎧</p>
                <div className="jukebox-carousel">
                  <button
                    className="jukebox-arrow"
                    onClick={() => setSongIndex((i) => (i - 1 + SONGS.length) % SONGS.length)}
                  >
                    ◀
                  </button>
                  <div className="jukebox-player">
                    <p className="jukebox-title">{SONGS[songIndex].title}</p>
                    <iframe
                      key={SONGS[songIndex].id}
                      width="100%"
                      height="80"
                      src={`https://www.youtube-nocookie.com/embed/${SONGS[songIndex].id}?controls=1&modestbranding=1&rel=0&playsinline=1`}
                      title={SONGS[songIndex].title}
                      allow="autoplay; encrypted-media"
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{ borderRadius: "14px", border: "none" }}
                    />
                  </div>
                  <button
                    className="jukebox-arrow"
                    onClick={() => setSongIndex((i) => (i + 1) % SONGS.length)}
                  >
                    ▶
                  </button>
                </div>
                <div className="jukebox-dots">
                  {SONGS.map((_, i) => (
                    <button
                      key={i}
                      className={`jukebox-dot ${i === songIndex ? "active" : ""}`}
                      onClick={() => setSongIndex(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
