import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "VINSETT Forge AI",
  description: "Transforme ideias em requisitos, backlog e entregas rastreáveis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
