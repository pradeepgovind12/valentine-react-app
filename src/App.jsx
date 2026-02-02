import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [step, setStep] = useState(0); // 0 = main question, 1 = "are you sure?", 2 = accepted
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noFloating, setNoFloating] = useState(false);

  const containerRef = useRef(null);
  const noWrapperRef = useRef(null);
  const noButtonRef = useRef(null);
  const lastMoveRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timeout);
  }, []);

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
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setAccepted(true);
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

        {!accepted ? (
          <div
            className={`screen screen--question ${
              isLoaded ? "screen--visible" : ""
            }`}
            ref={containerRef}
          >
            <div className="content">
              {step === 0 ? (
                <h1 className="headline">
                  Will you be my Valentine, Malati? <span>💖</span>
                </h1>
              ) : (
                <h1 className="headline">
                  Are you sure about that, Malati? <span>💘</span>
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
                  type="button"
                >
                  YES ❤️
                </button>

                <div
                  className="no-wrapper"
                  ref={noWrapperRef}
                  onMouseMove={handleNoWrapperMove}
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
              <div className="confetti-layer">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} className="confetti-piece" />
                ))}
              </div>
              <div className="hearts-foreground">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="heart-foreground" />
                ))}
              </div>
              <h1 className="headline-accepted">
                I LOVE YOU RAKHSASI <span>❤️🔥</span>
              </h1>
              <p className="accepted-subtitle">
                Forever my favorite kind of chaos, wrapped in love and fire.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

