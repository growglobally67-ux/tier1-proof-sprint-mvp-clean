"use client";

import React from "react";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { SprintProvider } from "../components/SprintContext";
import { AssistantChat } from "../components/AssistantChat";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <SprintProvider>
          <div className="flex min-h-screen">
            {/* Left sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="relative flex flex-1 flex-col">
              <TopBar />
              <main className="flex-1 px-4 pb-6 pt-4 md:px-8 md:pt-6">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
              </main>

              {/* Floating assistant (bottom-right) */}
              <AssistantChat />
            </div>
          </div>
        </SprintProvider>
      </body>
    </html>
  );
}
