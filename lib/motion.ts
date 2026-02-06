import { type Variants } from "framer-motion";

// Smooth ease curve for natural motion
const smoothEase = [0.22, 1, 0.36, 1] as const;

// Spring-like ease for playful bounce
const springEase = [0.34, 1.56, 0.64, 1] as const;

// --- Entrance Variants ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

export const fadeUpSpring: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: springEase },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: springEase },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// --- Container Variants (for staggered children) ---

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// --- Hover & Tap Variants ---

export const hoverLift = {
  y: -6,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

export const hoverScale = {
  scale: 1.03,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

export const tapScale = {
  scale: 0.97,
};

// --- Section reveal (for wrapping whole sections) ---

export const sectionReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

// --- Card item variant for use inside stagger containers ---

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

// --- Viewport settings for useInView ---

export const defaultViewport = { once: true, margin: "-80px" } as const;
export const earlyViewport = { once: true, margin: "-40px" } as const;
export const lateViewport = { once: true, margin: "-120px" } as const;
