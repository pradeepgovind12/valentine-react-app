import React, { useEffect, useRef, useState } from "react";
import memeVideo from "./are-you-comedy-me-video-meme-download.mp4";
import thanksMemeVideo from "./thanks-love-you-forever-video-meme-download.mp4";

const STORAGE_KEY = "valentineAcceptedAt";

const getDaysTogether = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const acceptedAt = new Date(Number(stored));
    const now = new Date();
    const diffMs = now - acceptedAt;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffDays > 0) return { value: diffDays, unit: diffDays === 1 ? "day" : "days" };
    if (diffHours > 0) return { value: diffHours, unit: diffHours === 1 ? "hour" : "hours" };
    if (diffMins > 0) return { value: diffMins, unit: diffMins === 1 ? "minute" : "minutes" };
    return { value: 0, unit: "just now" };
  } catch {
    return null;
  }
};

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [accepted, setAccepted] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noFloating, setNoFloating] = useState(false);
  const [showNoMeme, setShowNoMeme] = useState(false);
  const [showYesMeme, setShowYesMeme] = useState(false);
  const noMemeTimeoutRef = useRef(null);
  const yesMemeTimeoutRef = useRef(null);
  const yesMemePlayCountsRef = useRef([0, 0, 0, 0, 0]);
  const yesMemeVideoRefs = useRef([]);
  const noMemeEndedCountRef = useRef(0);
  const yesMemeFullyEndedCountRef = useRef(0);
  const [introText, setIntroText] = useState("");
  const [introDone, setIntroDone] = useState(false);

  const introMessage = "Mahi, I made you something…";

  const containerRef = useRef(null);
  const noWrapperRef = useRef(null);
  const noButtonRef = useRef(null);
  const lastMoveRef = useRef(0);

  const MEME_POSITIONS = [
    { top: "4%", left: "4%", className: "" },
    { top: "4%", right: "4%", left: "auto", className: "" },
    { bottom: "4%", left: "4%", top: "auto", className: "" },
    { bottom: "4%", right: "4%", top: "auto", left: "auto", className: "" },
    { top: "4%", left: "50%", transform: "translateX(-50%)", right: "auto", className: "meme-video--center" },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timeout);
  }, []);


  useEffect(() => {
    return () => {
      if (noMemeTimeoutRef.current) clearTimeout(noMemeTimeoutRef.current);
      if (yesMemeTimeoutRef.current) clearTimeout(yesMemeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    setIntroText("");
    setIntroDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i <= introMessage.length) {
        setIntroText(introMessage.slice(0, i));
        i++;
      } else {
        setIntroDone(true);
        clearInterval(id);
      }
    }, 80);
    return () => clearInterval(id);
  }, [showIntro]);

  const moveNoButton = () => {
    const wrapper = noWrapperRef.current;
    const button = noButtonRef.current;
    if (!wrapper || !button) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();

    const maxX = wrapperRect.width - btnRect.width;
    const maxY = wrapperRect.height - btnRect.height;

    // Desktop-only playful behavior
    if (window.innerWidth < 800) return;

    const nextX = Math.random() * Math.max(maxX, 0);
    const nextY = Math.random() * Math.max(maxY, 0);

    setNoFloating(true);
    setNoPosition({ x: nextX, y: nextY });
  };

  const handleNoHover = () => {
    // On hover, jump to a random location within the wrapper
    moveNoButton();
  };

  const handleNoPointerDown = (e) => {
    // If the pointer actually reaches the button, immediately dodge and block the click
    e.preventDefault();
    e.stopPropagation();
    setShowNoMeme(false);
    if (noMemeTimeoutRef.current) clearTimeout(noMemeTimeoutRef.current);
    moveNoButton();
  };

  const handleNoWrapperMove = (e) => {
    if (window.innerWidth < 800) return;

    // Move repeatedly while the cursor is playing in the NO area (desktop)
    const now = performance.now();
    const minInterval = 220; // ms between jumps to keep animation smooth
    if (now - lastMoveRef.current < minInterval) return;
    lastMoveRef.current = now;

    // Only react when the cursor is inside the wrapper bounds
    const wrapper = noWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    moveNoButton();
  };

  const handleYesClick = () => {
    setShowYesMeme(false);
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      const timestamp = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, String(timestamp));
      } catch (_) {}
      setAccepted(true);
    }
  };

  const handleNoMemeEnded = () => {
    noMemeEndedCountRef.current++;
    if (noMemeEndedCountRef.current >= 5) setShowNoMeme(false);
  };

  const handleYesMemeEnded = (i) => {
    if (yesMemePlayCountsRef.current[i] < 1) {
      yesMemePlayCountsRef.current[i]++;
      const video = yesMemeVideoRefs.current[i];
      if (video) video.play();
    } else {
      yesMemeFullyEndedCountRef.current++;
      if (yesMemeFullyEndedCountRef.current >= 5) setShowYesMeme(false);
    }
  };

  return (
    <div className="app-root">
      <div className={`gradient-bg ${isLoaded ? "gradient-bg--visible" : ""}`}>
        <div className="hearts-bg">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="heart-particle" />
          ))}
        </div>
        <div className="sparkles-layer" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="sparkle" style={{ "--i": i }} />
          ))}
        </div>

        {showNoMeme && (
          <div className="meme-overlay" aria-hidden>
            {MEME_POSITIONS.map((pos, i) => (
              <div
                key={`no-${i}`}
                className={`meme-video-wrapper ${pos.className || ""}`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  bottom: pos.bottom,
                  transform: pos.transform,
                }}
              >
                <video
                  src={memeVideo}
                  muted={i !== 0}
                  playsInline
                  autoPlay
                  onEnded={handleNoMemeEnded}
                  className="meme-video"
                />
              </div>
            ))}
          </div>
        )}

        {showYesMeme && (
          <div className="meme-overlay meme-overlay--yes" aria-hidden>
            {MEME_POSITIONS.map((pos, i) => (
              <div
                key={`yes-${i}`}
                className={`meme-video-wrapper ${pos.className || ""}`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  bottom: pos.bottom,
                  transform: pos.transform,
                }}
              >
                <video
                  ref={(el) => { yesMemeVideoRefs.current[i] = el; }}
                  src={thanksMemeVideo}
                  muted={i !== 0}
                  playsInline
                  autoPlay
                  onEnded={() => handleYesMemeEnded(i)}
                  className="meme-video"
                />
              </div>
            ))}
          </div>
        )}

        {showIntro ? (
          <div
            className={`screen screen--intro ${
              isLoaded ? "screen--visible" : ""
            }`}
            onClick={() => setShowIntro(false)}
            onKeyDown={(e) => e.key === "Enter" && setShowIntro(false)}
            role="button"
            tabIndex={0}
          >
            <div className="content content--intro">
              <p className="intro-text">
                {introText}
                {introDone ? "" : <span className="caret">|</span>}
              </p>
              <p className={`intro-hint ${introDone ? "intro-hint--visible" : ""}`}>
                tap or click to open
              </p>
            </div>
          </div>
        ) : !accepted ? (
          <div
            className={`screen screen--question ${
              isLoaded ? "screen--visible" : ""
            }`}
            ref={containerRef}
          >
            <div className="content content--question">
              {step === 0 ? (
                <h1 className="headline">
                  Will you be my Valentine, Mahi? <span>💖</span>
                </h1>
              ) : (
                <h1 className="headline">
                  Are you sure about that, Mahi? <span>💘</span>
                </h1>
              )}
              <p className="subtitle">
                {step === 0
                  ? "Think carefully... the right answer comes with infinite cuddles."
                  : "Last chance to run away. Are you absolutely, undeniably sure?"}
              </p>
              <div className="buttons-row">
                <button
                  className="btn btn-yes"
                  onClick={handleYesClick}
                  onMouseEnter={() => {
                    yesMemePlayCountsRef.current = [0, 0, 0, 0, 0];
                    yesMemeFullyEndedCountRef.current = 0;
                    setShowYesMeme(true);
                    if (yesMemeTimeoutRef.current) clearTimeout(yesMemeTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    if (yesMemeTimeoutRef.current) clearTimeout(yesMemeTimeoutRef.current);
                    yesMemeTimeoutRef.current = setTimeout(() => setShowYesMeme(false), 200);
                  }}
                  type="button"
                >
                  <span className="btn-yes-hearts">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className="btn-heart-float" />
                    ))}
                  </span>
                  YES ❤️
                </button>

                <div
                  className="no-wrapper"
                  ref={noWrapperRef}
                  onMouseMove={handleNoWrapperMove}
                  onMouseEnter={() => {
                    noMemeEndedCountRef.current = 0;
                    setShowNoMeme(true);
                  }}
                  onMouseLeave={() => {
                    if (noMemeTimeoutRef.current) clearTimeout(noMemeTimeoutRef.current);
                    noMemeTimeoutRef.current = setTimeout(() => setShowNoMeme(false), 150);
                  }}
                >
                  <button
                    className={`btn btn-no ${
                      noFloating ? "btn-no--floating" : ""
                    }`}
                    ref={noButtonRef}
                    style={
                      noFloating
                        ? {
                            left: `${noPosition.x}px`,
                            top: `${noPosition.y}px`,
                          }
                        : undefined
                    }
                    onMouseEnter={handleNoHover}
                    onMouseMove={handleNoHover}
                    onMouseDown={handleNoPointerDown}
                    type="button"
                  >
                    NO 😈
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="screen screen--accepted screen--visible">
            <div className="content content--accepted">
              <div className="hearts-foreground">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="heart-foreground" />
                ))}
              </div>
              <div className="confetti-layer">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} className="confetti-piece" />
                ))}
              </div>
              <h1 className="headline-accepted">
                I LOVE YOU RAKHSASI <span>❤️🔥</span>
              </h1>
              <p className="accepted-subtitle">
                Forever my favorite kind of chaos, wrapped in love and fire.
              </p>
              {(() => {
                const days = getDaysTogether();
                if (!days) return null;
                return (
                  <p className="days-together">
                    {days.unit === "just now"
                      ? "Just now you said yes! 💕"
                      : `${days.value} ${days.unit} since you said yes`}
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

