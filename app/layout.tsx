import "./globals.css";

export const metadata = {
  title: "Card Price GPT",
  description: "Pokémon card price lookup with OpenAI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
