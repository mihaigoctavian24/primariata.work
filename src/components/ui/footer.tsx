"use client";

import React from "react";
import Link from "next/link";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { reopenCookieConsent } from "@/components/cookie-consent/CookieConsentBanner";

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Platformă",
    links: [
      { name: "Funcționalități", href: "#features" },
      { name: "Prețuri", href: "#pricing" },
      { name: "Documentație", href: "#docs" },
      { name: "Integrări", href: "#integrations" },
    ],
  },
  {
    title: "Companie",
    links: [
      { name: "Despre noi", href: "#about" },
      { name: "Echipă", href: "#team" },
      { name: "Blog", href: "#blog" },
      { name: "Cariere", href: "#careers" },
    ],
  },
  {
    title: "Suport",
    links: [
      { name: "Ajutor", href: "#help" },
      { name: "Contact", href: "#contact" },
      { name: "Întrebări frecvente", href: "#faq" },
      { name: "Status", href: "#status" },
      { name: "Autentificare personal", href: "/admin/login" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Termeni si Conditii", href: "/termeni" },
  { name: "Confidentialitate", href: "/confidentialitate" },
];

export const Footer = ({
  logo = {
    url: "/",
    src: "/vector_heart.svg",
    alt: "primariaTa logo",
    title: "primariaTa",
  },
  sections = defaultSections,
  description = "Platformă SaaS white-label care digitalizează complet procesele administrative locale din România.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} primariaTa.work. Toate drepturile rezervate.`,
  legalLinks = defaultLegalLinks,
}: FooterProps) => {
  return (
    <footer className="mt-[200px] bg-zinc-950 py-16 md:py-24 dark:bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start">
          {/* Logo & Description Section */}
          <div className="flex w-full max-w-sm flex-col gap-6">
            {/* Logo */}
            <Link href={logo.url} className="flex items-center gap-2">
              <HeartIcon className="text-primary h-8 w-8" />
              <h2 className="font-montreal-medium text-foreground text-xl font-bold">
                primăria<span className="text-primary">Ta</span>
                <HeartIcon
                  className="text-primary ml-0.5 inline-block"
                  style={{ width: "0.9em", height: "0.9em" }}
                />
              </h2>
            </Link>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

            {/* Social Links */}
            <ul className="text-muted-foreground flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-primary transition-colors">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Sections */}
          <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="font-montreal-medium text-foreground mb-4 font-bold">
                  {section.title}
                </h3>
                <ul className="text-muted-foreground space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="hover:text-primary transition-colors">
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border mt-12 flex flex-col justify-between gap-4 border-t pt-8 text-xs text-gray-400 md:flex-row md:items-center dark:text-gray-700">
          <p className="order-2 md:order-1">{copyright}</p>
          <ul className="order-1 flex flex-wrap gap-4 md:order-2 md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary transition-colors">
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
            <li className="hover:text-primary transition-colors">
              <button
                type="button"
                onClick={reopenCookieConsent}
                className="cursor-pointer hover:underline"
              >
                Preferinte Cookie
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
