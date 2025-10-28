"use client";

import { motion } from "framer-motion";

/**
 * AnimatedHowItWorks Component
 *
 * Displays step-by-step process with cascading animations
 */
export function AnimatedHowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Date personale",
      description:
        "Începi prin a ne spune câteva informații de bază: nume, județ, localitate. Email-ul este opțional.",
      delay: 5.0,
    },
    {
      number: 2,
      title: "Selectează categoria",
      description:
        "Alegi dacă ești cetățean sau funcționar public - chestionarul se adaptează în funcție de alegere.",
      delay: 5.15,
    },
    {
      number: 3,
      title: "Răspunde la întrebări",
      description:
        "10-12 întrebări simple despre nevoile și așteptările tale legate de serviciile digitale.",
      delay: 5.3,
    },
    {
      number: 4,
      title: "Trimite răspunsurile",
      description:
        "Revizuiești răspunsurile și trimiți chestionarul. Gata! Mulțumim pentru ajutor! 🎉",
      delay: 5.45,
    },
  ];

  return (
    <section className="bg-muted/30 px-4 py-16">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          className="mb-12 text-center text-3xl font-bold"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 4.85, duration: 0.6 }}
        >
          Cum funcționează?
        </motion.h2>

        <div className="space-y-8">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="flex gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.6 }}
            >
              <div className="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold">
                {step.number}
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
