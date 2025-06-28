'use client'

import { useState } from 'react'
import { ChevronRightIcon, ClockIcon, FireIcon, GlobeAltIcon, ChartBarIcon, CpuChipIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline'

const categories = [
  { id: 'all', name: 'Alle', icon: GlobeAltIcon, color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300' },
  { id: 'trending', name: 'Trending', icon: FireIcon, color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300' },
  { id: 'business', name: 'Business', icon: ChartBarIcon, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300' },
  { id: 'technology', name: 'Technologie', icon: CpuChipIcon, color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300' },
  { id: 'health', name: 'Gesundheit', icon: HeartIcon, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300' }
]

const newsData = [
  {
    id: 1,
    category: 'trending',
    title: 'KI-Revolution: OpenAI kündigt bahnbrechende neue Features an',
    excerpt: 'Das Unternehmen präsentiert revolutionäre Funktionen, die die Art wie wir mit künstlicher Intelligenz interagieren fundamental verändern könnten.',
    author: 'Sarah Chen',
    publishedAt: '2 Stunden',
    readTime: '4 Min',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['KI', 'OpenAI', 'Innovation'],
    featured: true
  },
  {
    id: 2,
    category: 'business',
    title: 'Börsen erreichen neue Rekordhöhen trotz globaler Unsicherheiten',
    excerpt: 'Investoren zeigen sich optimistisch während die wichtigsten Aktienindizes neue Allzeithochs markieren.',
    author: 'Michael Weber',
    publishedAt: '4 Stunden',
    readTime: '3 Min',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Börse', 'Finanzen', 'Rekord']
  },
  {
    id: 3,
    category: 'technology',
    title: 'Quantencomputer-Durchbruch: IBM meldet 50% Leistungssteigerung',
    excerpt: 'Der neue Quantenprozessor verspricht signifikante Verbesserungen bei der Lösung komplexer Berechnungen.',
    author: 'Dr. Anna Müller',
    publishedAt: '6 Stunden',
    readTime: '5 Min',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Quantencomputer', 'IBM', 'Durchbruch']
  },
  {
    id: 4,
    category: 'health',
    title: 'Neue Studie zeigt vielversprechende Ergebnisse für Alzheimer-Therapie',
    excerpt: 'Forscher haben einen innovativen Behandlungsansatz entwickelt, der das Fortschreiten der Krankheit verlangsamen könnte.',
    author: 'Prof. Thomas Klein',
    publishedAt: '8 Stunden',
    readTime: '6 Min',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Alzheimer', 'Forschung', 'Therapie']
  },
  {
    id: 5,
    category: 'trending',
    title: 'SpaceX gelingt erneut spektakuläre Raketenerholung',
    excerpt: 'Die Falcon Heavy absolvierte eine weitere erfolgreiche Mission und landete sicher zurück auf der Erde.',
    author: 'Lisa Rodriguez',
    publishedAt: '12 Stunden',
    readTime: '3 Min',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['SpaceX', 'Raumfahrt', 'Innovation']
  },
  {
    id: 6,
    category: 'business',
    title: 'Deutsche Startups erhalten Rekordinvestitionen in 2025',
    excerpt: 'Venture Capital Firmen investieren verstärkt in innovative deutsche Technologie-Unternehmen.',
    author: 'Alexander Hoffmann',
    publishedAt: '1 Tag',
    readTime: '4 Min',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Startups', 'Investment', 'Deutschland']
  },
  {
    id: 7,
    category: 'technology',
    title: 'Apple kündigt revolutionäres AR-Headset für Entwickler an',
    excerpt: 'Das neue Gerät soll die Grenzen zwischen digitaler und physischer Welt weiter verwischen.',
    author: 'Jennifer Park',
    publishedAt: '1 Tag',
    readTime: '5 Min',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Apple', 'AR', 'Headset']
  },
  {
    id: 8,
    category: 'health',
    title: 'Personalisierte Medizin: KI hilft bei maßgeschneiderten Therapien',
    excerpt: 'Künstliche Intelligenz ermöglicht es Ärzten, individuelle Behandlungspläne für jeden Patienten zu erstellen.',
    author: 'Dr. Maria Gonzalez',
    publishedAt: '2 Tage',
    readTime: '7 Min',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Medizin', 'KI', 'Personalisierung']
  }
]

export default function Newsfeed() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredNews = selectedCategory === 'all' 
    ? newsData 
    : newsData.filter(article => article.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-6">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-violet-900 bg-clip-text text-transparent mb-4">
            News Feed
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Entdecken Sie die neuesten Nachrichten aus Technologie, Business und Wissenschaft
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white border-transparent shadow-lg shadow-blue-500/25' 
                    : category.color
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Featured Article */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            {(() => {
              const featured = newsData.find(article => article.featured)
              if (!featured) return null
              
              return (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20"></div>
                  <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
                    <div className="flex flex-col justify-center space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-300 text-sm font-medium rounded-full w-fit">
                        <FireIcon className="w-4 h-4" />
                        Featured Story
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                        {featured.title}
                      </h2>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="font-medium">{featured.author}</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {featured.publishedAt}
                        </div>
                        <span>{featured.readTime}</span>
                      </div>
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors w-fit">
                        Artikel lesen
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <img 
                        src={featured.image} 
                        alt={featured.title}
                        className="w-full h-64 lg:h-80 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* News Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredNews.filter(article => !article.featured || selectedCategory !== 'all').map((article) => (
            <article 
              key={article.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/50 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-slate-600 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{article.author}</span>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {article.publishedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <span>{article.readTime}</span>
                    <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25">
            Weitere Artikel laden
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}