"use client";

import { motion } from "framer-motion";
import { FileText, Users, BarChart3, Shield } from "lucide-react";

/**
 * AnimatedFeatures Component
 *
 * Displays feature cards with cascading blur-in animations
 */
export function AnimatedFeatures() {
  const features = [
    {
      icon: Users,
      title: "Pentru cetățeni",
      description: "Spune-ne ce servicii digitale ai nevoie și cum le-ai folosi",
      delay: 4.2,
    },
    {
      icon: FileText,
      title: "Pentru funcționari",
      description: "Împărtășește experiența ta cu sistemele actuale și nevoile tale",
      delay: 4.35,
    },
    {
      icon: BarChart3,
      title: "Rezultate concrete",
      description: "Răspunsurile tale vor influența direct dezvoltarea platformei",
      delay: 4.5,
    },
    {
      icon: Shield,
      title: "Securitate & Privacy",
      description: "Datele tale sunt protejate. Email-ul este opțional.",
      delay: 4.65,
    },
  ];

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          className="mb-12 text-center text-3xl font-bold"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 4.0, duration: 0.6 }}
        >
          De ce este important?
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
              >
                <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Icon className="text-primary h-8 w-8" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
