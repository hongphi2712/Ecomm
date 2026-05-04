import '@/styles/globals.css';

export const metadata = {
  title: 'FinCommerce Platform',
  description: 'Enterprise e-commerce and payment simulation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
