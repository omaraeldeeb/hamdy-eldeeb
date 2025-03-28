"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl"></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="wrapper py-20 md:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-block">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-primary to-primary/30 mb-4"
              ></motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 drop-shadow-sm">
              LUXURY BATH
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl md:text-3xl font-medium text-muted-foreground"
            >
              <Typewriter
                words={[
                  "Elegant Designs",
                  "Premium Quality",
                  "Modern Solutions",
                  "Timeless Elegance",
                ]}
                loop={true}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1500}
              />
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-muted-foreground text-lg max-w-md leading-relaxed"
            >
              Transform your bathroom into a sanctuary of luxury with our
              premium sanitaryware collection. Crafted for those who appreciate
              refined elegance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="pt-4"
            >
              <Link href="/search">
                <Button
                  size="lg"
                  className="rounded-md px-10 py-6 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all hover:scale-105 shadow-lg"
                >
                  Explore Collection
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative flex justify-center"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-70"></div>
            <div className="relative w-[90%] max-w-[500px] transform hover:rotate-1 transition-all duration-500 z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-xl"></div>
              <Image
                src="/images/premium-faucet.png"
                alt="Luxury Faucet"
                width={500}
                height={500}
                className="rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-6 -right-6 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-primary/20"
              >
                <span className="text-sm text-primary font-medium">
                  Premium Quality
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
