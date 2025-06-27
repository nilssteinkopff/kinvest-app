"use client";
import type React from "react";
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cormorant',
});

export function Logo(props: React.ComponentProps<'span'>) {
  return (
    <span
      {...props}
      className={`
        ${cormorant.variable} 
        font-cormorant 
        text-3xl font-bold 
        text-gray-950 dark:text-white 
        ${props.className ?? ''}
      `}
    >
      KInvest.ai
    </span>
  );
}