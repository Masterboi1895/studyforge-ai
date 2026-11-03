import type { ReactNode } from "react";
import "./globals.css";
export const metadata = { title: "StudyForge AI | Study Smarter", description: "Interactive visual lessons and practice tests for high school students." };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
