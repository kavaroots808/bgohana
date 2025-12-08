import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BG Ohana Tree',
  description: 'Network Marketing Genealogy Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
