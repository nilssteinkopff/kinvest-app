import { Book, Bookshelf } from "@/components/bookshelf";
import { ContentLink } from "@/components/content-link";
import { PageSection } from "@/components/page-section";
import { VideoCard } from "@/components/video-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wissen - KInvest.ai",
  description:
    "Eine Sammlung von Ressourcen, die Ihnen helfen, Unsicherheiten zu navigieren und Entscheidungen zu treffen, die mit Ihren Werten und Zielen übereinstimmen.",
};

export default function Page() {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl/10 font-normal tracking-tight text-gray-950 dark:text-white">
          Wissen
        </h1>
        <p className="mt-6 max-w-xl text-base/7 text-gray-600 dark:text-gray-400">
          Eine Sammlung von Ressourcen, die Ihnen helfen, Unsicherheiten zu navigieren und 
          Entscheidungen zu treffen, die mit Ihren Werten und Zielen übereinstimmen.
        </p>
      </div>

      {/* Writing Section */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Artikel</h2>
          <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
            Lernen Sie, Signal von Rauschen und Instinkte von Impulsen zu unterscheiden.
          </p>
        </div>

        <div className="max-w-2xl space-y-6 md:col-span-2">
          <ContentLink
            type="article"
            title="The Psychology of Investment Decisions"
            description="Wie moderne Neurowissenschaft Anlageentscheidungen unterstützt."
            href="#"
          />
          <ContentLink
            type="article"
            title="Risk Management: A Complete Guide"
            description="Umfassender Leitfaden für effektives Risikomanagement in Investmentportfolios."
            href="#"
          />
          <ContentLink
            type="article"
            title="Market Timing vs. Time in Market"
            description="Warum langfristige Strategien oft erfolgreicher sind als Market Timing."
            href="#"
          />
          <ContentLink
            type="article"
            title="Diversification Strategies That Actually Work"
            description="Bewährte Diversifikationsstrategien für moderne Portfolios."
            href="#"
          />
          <ContentLink
            type="article"
            title="Understanding Market Volatility"
            description="Wie Sie Marktvolatilität zu Ihrem Vorteil nutzen können."
            href="#"
          />
        </div>
      </div>

      {/* Podcasts Section */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Podcasts</h2>
          <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
            Fesselnde Gespräche von führenden Investment-Experten und Finanzprofis.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <VideoCard
              title="The Intelligent Investor Podcast: EP 142"
              subtitle="Warren Buffett Interview"
              url="#"
              target="_blank"
              duration={3720}
            />
            <VideoCard
              title="Market Movers with Ray Dalio"
              subtitle="Bridgewater Associates"
              url="#"
              target="_blank"
              duration={4454}
            />
            <VideoCard
              title="The Investment Show"
              subtitle="Financial Times"
              url="#"
              target="_blank"
              duration={5040}
            />
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Tools</h2>
          <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
            Nützliche Werkzeuge für Analyse, Recherche und Entscheidungsfindung.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="@container">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 @2xl:grid-cols-2">
              <ContentLink
                type="tool"
                title="TradingView"
                description="Professionelle Charts und technische Analyse für alle Märkte."
                href="#"
              />
              <ContentLink
                type="tool"
                title="Portfolio Analyzer"
                description="Analysieren Sie Ihr Portfolio auf Risiken und Chancen."
                href="#"
              />
              <ContentLink
                type="tool"
                title="Market Screener"
                description="Finden Sie die besten Investmentmöglichkeiten mit unserem Screener."
                href="#"
              />
              <ContentLink
                type="tool"
                title="Risk Calculator"
                description="Berechnen Sie das Risiko Ihrer Investmentstrategien."
                href="#"
              />
              <ContentLink
                type="tool"
                title="Economic Calendar"
                description="Bleiben Sie über wichtige Wirtschaftsereignisse informiert."
                href="#"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Bücher</h2>
          <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
            Eine sorgfältig kuratierte Sammlung von Büchern über Investment, 
            Finanzen und persönliches Wachstum.
          </p>
        </div>

        <div className="md:col-span-2">
          <Bookshelf>
            <Book
              title="The Intelligent Investor"
              author="Benjamin Graham"
              href="#"
            />
            <Book
              title="A Random Walk Down Wall Street"
              author="Burton Malkiel"
              href="#"
            />
            <Book
              title="The Psychology of Money"
              author="Morgan Housel"
              href="#"
            />
            <Book
              title="Common Stocks and Uncommon Profits"
              author="Philip Fisher"
              href="#"
            />
            <Book
              title="The Little Book of Common Sense Investing"
              author="John Bogle"
              href="#"
            />
          </Bookshelf>
        </div>
      </div>
    </div>
  );
}