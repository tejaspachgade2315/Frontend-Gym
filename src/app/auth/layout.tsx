import React, { ReactNode } from "react";

interface LayoutProps {
  readonly children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-my-image bg-cover" />
          <div className="relative z-20 flex items-center text-lg font-medium">GYM MANAGEMENT</div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Strength doesn’t come from what you can do. It comes from overcoming the things you once thought
                you couldn’t.&rdquo;
              </p>
              <footer className="text-sm">~ Admin</footer>
            </blockquote>
          </div>
        </div>
        <div className="flex h-full lg:p-8">{children}</div>
      </div>
    </main>
  );
}
