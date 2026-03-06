"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Restaurant } from "@/lib/restaurants";

// ── Aurora background (generating step only) ─────────────────────────────────
function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -inset-[100px] opacity-40"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #1a73e8 0deg, #4285f4 72deg, #0d47a1 144deg, #1565c0 216deg, #1a73e8 288deg, #4285f4 360deg)",
          filter: "blur(80px)",
          animation: "auroraRotate 8s linear infinite",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(26,115,232,0.25) 0%, transparent 70%)",
          animation: "auroraPulse 4s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes auroraRotate { to { transform: rotate(360deg); } }
        @keyframes auroraPulse { from { opacity: 0.3; } to { opacity: 0.7; } }
      `}</style>
    </div>
  );
}

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= count ? "#f5a623" : "#d1d1d1", fontSize: size }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ── Google icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  name,
  dim,
}: {
  review: Restaurant["review"];
  name: string;
  dim?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-xl p-4 border border-[#e8e8e8] shadow-sm transition-opacity duration-300"
      style={{ opacity: dim ? 0.4 : 1 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4285f4, #34a853)",
            fontFamily: "Georgia, serif",
          }}
        >
          {review.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#1a1a1a]">
            {review.author}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars count={review.stars} />
            <span className="text-[11px] text-[#999]">{review.date}</span>
          </div>
        </div>
        <GoogleIcon />
      </div>
      <p className="text-[13px] text-[#444] leading-relaxed">{review.text}</p>
      {!dim && (
        <div className="mt-3 px-3 py-2 bg-[#fff3cd] border border-[#ffc107] rounded-md flex items-center gap-2 text-[11px] text-[#856404]">
          <span>⚠️</span>
          <span>Geen reactie van eigenaar — bezoekers zien dit</span>
        </div>
      )}
    </div>
  );
}

// ── Typing animation ──────────────────────────────────────────────────────────
function TypingResponse({
  text,
  onDone,
}: {
  text: string;
  onDone: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    idx.current = 0;
    doneRef.current = false;
    setDisplayed("");
    setDone(false);

    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        if (!doneRef.current) {
          doneRef.current = true;
          clearInterval(interval);
          setDone(true);
          setTimeout(onDone, 700);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <div className="bg-[#f0f7ff] rounded-xl p-4 border border-[#c2d9f7]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a73e8, #0d47a1)" }}>
          <span className="text-white text-[11px]">✦</span>
        </div>
        <span className="text-[11px] font-bold text-[#1a73e8] tracking-widest uppercase">
          Review Recovery AI
        </span>
        {!done && (
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] block"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-[13px] text-[#1a1a1a] leading-relaxed">
        {displayed}
        {!done && (
          <motion.span
            className="inline-block border-r-2 border-[#1a73e8] ml-0.5 h-3 w-[2px]"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </p>
    </div>
  );
}

// ── Step progress bar ─────────────────────────────────────────────────────────
const STEPS = ["review", "generating", "response", "cta"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  review: "Review",
  generating: "AI Reactie",
  response: "Resultaat",
  cta: "Starten",
};

function StepBar({ current }: { current: Step }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex gap-1.5 mb-5">
      {STEPS.map((s, i) => {
        const active = s === current;
        const done = i < currentIdx;
        return (
          <div key={s} className="flex-1 text-center">
            <div className="h-[3px] rounded-sm mb-1 overflow-hidden bg-[#e0e0e0]">
              <motion.div
                className="h-full bg-[#1a73e8]"
                initial={{ width: 0 }}
                animate={{ width: done || active ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span
              className="text-[9px] font-medium"
              style={{
                color: active ? "#1a73e8" : done ? "#666" : "#bbb",
                fontWeight: active ? 700 : 400,
              }}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main demo component ───────────────────────────────────────────────────────
const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function DemoClient({
  restaurant,
  allRestaurants,
}: {
  restaurant: Restaurant;
  allRestaurants: Restaurant[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("review");
  const [showSelector, setShowSelector] = useState(false);

  // Secret gesture: triple-tap the header logo area
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setShowSelector((v) => !v);
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 600);
    }
  }, []);

  const goTo = (id: string) => {
    setShowSelector(false);
    setStep("review");
    router.push(`/${id}`);
  };

  const next = () => {
    setStep((s) => {
      if (s === "review") return "generating";
      if (s === "response") return "cta";
      return s;
    });
  };

  const reset = () => {
    setStep("review");
    setShowSelector(false);
  };

  const ctaWhatsApp = `https://wa.me/31612345678?text=${encodeURIComponent(`Hallo! Ik wil meer weten over Review Recovery voor ${restaurant.name}.`)}`;

  return (
    <div className="max-w-[390px] mx-auto min-h-dvh bg-[#f5f5f7] relative overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={handleLogoTap}
          className="text-left select-none active:opacity-70"
        >
          <div className="text-[10px] text-[#1a73e8] font-bold tracking-[0.12em] uppercase">
            Review Recovery
          </div>
          <div className="text-[13px] font-semibold text-[#1a1a1a]">
            {restaurant.name}
          </div>
        </button>
        {/* Invisible tap zone — only shows selector via secret gesture */}
      </div>

      {/* Secret restaurant selector */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[56px] left-1/2 -translate-x-1/2 w-[390px] bg-white border-b border-[#e8e8e8] z-40 shadow-xl max-h-[70vh] overflow-y-auto"
          >
            {allRestaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => goTo(r.id)}
                className="w-full px-5 py-3 flex justify-between items-center border-b border-[#f5f5f5] text-left active:bg-[#f0f7ff]"
                style={{ background: r.id === restaurant.id ? "#f0f7ff" : "#fff" }}
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#1a1a1a]">
                    {r.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars count={Math.round(r.rating)} size={11} />
                    {r.reviews && (
                      <span className="text-[11px] text-[#999]">
                        {r.reviews} reviews
                      </span>
                    )}
                  </div>
                </div>
                {r.id === restaurant.id && (
                  <span className="text-[#1a73e8] text-base">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="px-4 pt-5 pb-10 relative">
        <StepBar current={step} />

        <AnimatePresence mode="wait">
          {/* STEP 1: Review */}
          {step === "review" && (
            <motion.div
              key="review"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-[22px] text-[#1a1a1a] mb-1.5">
                Onbeantwoorde review
              </h2>
              <p className="text-[13px] text-[#666] mb-4">
                Dit zien potentiële gasten van{" "}
                <strong>{restaurant.name}</strong> op Google.
              </p>

              <ReviewCard review={restaurant.review} name={restaurant.name} />

              <div className="mt-3.5 p-3.5 bg-white rounded-xl border border-[#e8e8e8] flex gap-3 items-start">
                <span className="text-xl">📉</span>
                <div>
                  <div className="text-[12px] font-bold text-[#1a1a1a] mb-1">
                    Wat dit kost
                  </div>
                  <div className="text-[12px] text-[#666] leading-relaxed">
                    Elke onbeantwoorde negatieve review kost gemiddeld{" "}
                    <strong className="text-[#d32f2f]">
                      3–5 toekomstige reserveringen
                    </strong>
                    . Bezoekers lezen reacties van eigenaren voordat ze boeken.
                  </div>
                </div>
              </div>

              <motion.button
                onClick={next}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 py-4 rounded-xl text-white font-bold text-[15px] tracking-wide shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                  boxShadow: "0 4px 20px rgba(26,115,232,0.4)",
                }}
              >
                Bekijk hoe AI dit oplost →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative"
            >
              {/* Aurora lives behind the content on this step */}
              <div className="absolute -inset-4 -top-5 rounded-2xl overflow-hidden -z-10 opacity-60">
                <Aurora />
              </div>

              <h2 className="font-[family-name:var(--font-playfair)] text-[22px] text-[#1a1a1a] mb-1.5">
                AI schrijft reactie...
              </h2>
              <p className="text-[13px] text-[#666] mb-4">
                Professioneel, persoonlijk, in uw toon.
              </p>

              <ReviewCard
                review={restaurant.review}
                name={restaurant.name}
                dim
              />

              <div className="mt-3.5">
                <TypingResponse
                  text={restaurant.goodResponse}
                  onDone={() => setStep("response")}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: Before / After */}
          {step === "response" && (
            <motion.div
              key="response"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-[22px] text-[#1a1a1a] mb-1.5">
                Het verschil
              </h2>
              <p className="text-[13px] text-[#666] mb-4">
                Zo zien toekomstige gasten uw restaurant.
              </p>

              {/* Before */}
              <div className="mb-3">
                <div className="text-[10px] font-bold tracking-widest text-[#d32f2f] uppercase mb-1.5">
                  ❌ Zonder Review Recovery
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-[#ffcdd2]">
                  <div className="text-[12px] text-[#999] italic mb-2">
                    Geen reactie van de eigenaar.
                  </div>
                  <ReviewCard
                    review={restaurant.review}
                    name={restaurant.name}
                  />
                </div>
              </div>

              {/* After */}
              <div className="mb-4">
                <div className="text-[10px] font-bold tracking-widest text-[#2e7d32] uppercase mb-1.5">
                  ✅ Met Review Recovery
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-[#c8e6c9]">
                  <ReviewCard
                    review={restaurant.review}
                    name={restaurant.name}
                    dim
                  />
                  <div className="mt-3 pl-3 border-l-[3px] border-[#1a73e8]">
                    <div className="text-[11px] text-[#1a73e8] font-bold mb-1">
                      Reactie van de eigenaar
                    </div>
                    <p className="text-[12px] text-[#444] leading-relaxed">
                      {restaurant.goodResponse}
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={next}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-xl text-white font-bold text-[15px] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                  boxShadow: "0 4px 20px rgba(26,115,232,0.4)",
                }}
              >
                Hoe werkt het? →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 4: CTA */}
          {step === "cta" && (
            <motion.div
              key="cta"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-[22px] text-[#1a1a1a] mb-5">
                Zo eenvoudig werkt het
              </h2>

              {[
                {
                  icon: "🔗",
                  title: "Koppel Google",
                  desc: "Eenmalig uw Google-account verbinden. Duurt 5 minuten.",
                },
                {
                  icon: "✦",
                  title: "AI schrijft reacties",
                  desc: "Op elke nieuwe review — negatief én positief — automatisch.",
                },
                {
                  icon: "✅",
                  title: "U keurt goed",
                  desc: "Per e-mail of WhatsApp. Eén klik. Reactie geplaatst.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex gap-3.5 py-3.5 border-b border-[#f0f0f0] last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f0f7ff] flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">
                      {item.title}
                    </div>
                    <div className="text-[12px] text-[#666] leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="mt-5 p-4 bg-[#f0f7ff] rounded-xl border border-[#c2d9f7] text-center">
                <div
                  className="text-[22px] font-extrabold text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  €149{" "}
                  <span className="text-[13px] font-normal text-[#666]">
                    /maand
                  </span>
                </div>
                <div className="text-[11px] text-[#666] mt-1">
                  Geen opstartkosten · Opzegbaar per maand
                </div>
              </div>

              <motion.a
                href={ctaWhatsApp}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center w-full mt-4 py-4 rounded-xl text-white font-bold text-[15px] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                  boxShadow: "0 4px 20px rgba(26,115,232,0.4)",
                }}
              >
                Vandaag starten →
              </motion.a>

              <button
                onClick={reset}
                className="w-full mt-3 py-3 rounded-xl text-[13px] text-[#666] border border-[#e0e0e0] bg-transparent"
              >
                ↩ Opnieuw bekijken
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
