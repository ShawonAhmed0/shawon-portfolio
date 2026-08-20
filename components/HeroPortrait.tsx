"use client";

import { useEffect, useRef, useState } from "react";
import { portrait } from "@/content/site";

/**
 * Looping portrait clip, falling back to the cutout still.
 *
 * The clip was shot on a cream backdrop matching --ink and the canvas flattens
 * to paper behind it, so it needs no alpha and no keying — only the edges are
 * softened by .portrait-clip's mask.
 */
export default function HeroPortrait() {
  const [useVideo, setUseVideo] = useState(Boolean(portrait.video));
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!useVideo) return;
    const v = videoRef.current;
    if (!v) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (reduce.matches) return;
      void v.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting && !document.hidden ? play() : v.pause()),
      { threshold: 0 },
    );
    io.observe(v);

    const onVis = () => (document.hidden ? v.pause() : play());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [useVideo]);

  return (
    <figure className="portrait-wrap w-[300px] sm:w-[340px] md:w-[380px] lg:w-[440px]">
      {useVideo && portrait.video ? (
        <video
          ref={videoRef}
          src={portrait.video}
          poster={portrait.poster}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          aria-label={portrait.alt}
          onError={() => setUseVideo(false)}
          className="portrait-clip block aspect-[4/5] w-full object-cover"
          style={{ objectPosition: "center 14%" }}
        />
      ) : (
        <>
          <img src={portrait.src} alt="" aria-hidden className="portrait-echo" />
          <img
            src={portrait.src}
            alt={portrait.alt}
            width={800}
            height={999}
            fetchPriority="high"
            decoding="async"
            className="portrait-cutout block h-auto w-full"
          />
        </>
      )}
    </figure>
  );
}
