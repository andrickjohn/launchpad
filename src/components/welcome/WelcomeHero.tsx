'use client'

import { Rocket, Target, Zap, Users, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function WelcomeHero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Your Launch Command Center
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-slide-up">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              LaunchPad
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-slide-up-delay">
            The personal launch command center that composes Apify, Resend, Claude AI, and Reddit
            into <strong>one clean dashboard</strong> for surgical product launches.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12 animate-slide-up-delay-2">
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <Rocket className="h-5 w-5" />
              Create Your First Campaign
            </Link>
            <Link
              href="/prospects/import"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 font-semibold"
            >
              <Users className="h-5 w-5" />
              Import Prospects
            </Link>
          </div>

          {/* Cost Badge */}
          <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Zap className="h-4 w-4 text-yellow-500" />
            Under <strong className="text-primary-600 dark:text-primary-400">$10/month</strong> vs $200+ competitors
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {[
            {
              icon: Target,
              title: 'AI-Powered Targeting',
              description: 'Score prospects, find similar leads, and get ranked channel recommendations with Claude AI.',
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              icon: TrendingUp,
              title: 'Real Metrics',
              description: 'Track response rates, open rates, conversions, and see what templates actually work.',
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              icon: Zap,
              title: 'Industry Agnostic',
              description: 'Works for dentists, GovCon, YouTubers, or any market. AI adapts the strategy to your product.',
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Quick Start Guide
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Create a Campaign', desc: 'AI will generate a full launch brief with ranked channels' },
              { step: 2, title: 'Import Prospects', desc: 'CSV upload or manual entry - works with Apify exports' },
              { step: 3, title: 'Score & Draft', desc: 'AI scores prospects and writes personalized cold emails' },
              { step: 4, title: 'Send & Track', desc: 'Send via Resend (100 free/day) and watch metrics in real-time' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  )
}
