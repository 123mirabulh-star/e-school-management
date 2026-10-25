import React from 'react';
import { WebsiteCustomPage, WebsitePageSection } from '../../types';
import { AppDatabase } from '../../services/storage';
import { ArrowRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { t, getLocalizedField } from '../../services/i18n';

interface PublicCustomPageProps {
  page: WebsiteCustomPage;
  db: AppDatabase;
  onNavigate: (page: string) => void;
}

export const PublicCustomPage: React.FC<PublicCustomPageProps> = ({ page, db, onNavigate }) => {
  const { language } = useLanguage();
  // Sort sections by order
  const sections = [...page.sections].sort((a, b) => a.order - b.order);

  const renderSection = (section: WebsitePageSection) => {
    const title = getLocalizedField(section, 'title', language) || getLocalizedField(section, 'heading', language);
    const subtitle = getLocalizedField(section, 'subtitle', language) || getLocalizedField(section, 'subheading', language);
    const content = getLocalizedField(section, 'content', language);
    const buttonText = getLocalizedField(section, 'buttonText', language);

    switch (section.type) {
      case 'hero':
        return (
          <div
            key={section.id}
            className="relative bg-slate-950 text-white py-16 md:py-24 px-4 overflow-hidden border-b border-slate-800"
          >
            {section.imageUrl && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${section.imageUrl})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/75"></div>
              </>
            )}
            <div className="relative max-w-5xl mx-auto text-center space-y-4">
              {subtitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  {subtitle}
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h1>
              {content && (
                <p className="text-slate-200 max-w-3xl mx-auto text-base md:text-lg leading-relaxed whitespace-pre-line">
                  {content}
                </p>
              )}
              {buttonText && (
                <div className="pt-4">
                  {section.buttonLink?.startsWith('http') ? (
                    <a
                      href={section.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      {buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (section.buttonLink) {
                          onNavigate(section.buttonLink.replace('/', ''));
                        }
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      {buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={section.id} className="py-12 px-4 max-w-4xl mx-auto">
            {title && (
              <div className="mb-6 pb-2 border-b border-slate-200">
                {subtitle && (
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
                    {subtitle}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
              </div>
            )}
            {section.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-slate-200 max-h-96">
                <img src={section.imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {content}
            </div>
          </div>
        );

      case 'features':
        return (
          <div key={section.id} className="py-14 px-4 bg-slate-50 border-y border-slate-200">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-10">
                {subtitle && (
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
                    {subtitle}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
                {content && (
                  <p className="mt-2 text-slate-600 text-sm md:text-base">{content}</p>
                )}
              </div>

              {section.items && section.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">
                        {getLocalizedField(item, 'title', language)}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {getLocalizedField(item, 'description', language)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'cards':
        return (
          <div key={section.id} className="py-14 px-4 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              {subtitle && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
                  {subtitle}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
              {content && (
                <p className="mt-2 text-slate-600 text-sm md:text-base">{content}</p>
              )}
            </div>

            {section.items && section.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, idx) => {
                  const itemTitle = getLocalizedField(item, 'title', language);
                  const itemDesc = getLocalizedField(item, 'description', language);
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                    >
                      {item.imageUrl && (
                        <div className="h-44 overflow-hidden bg-slate-100">
                          <img src={item.imageUrl} alt={itemTitle} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{itemTitle}</h3>
                          <p className="text-slate-600 text-xs mt-2 leading-relaxed">{itemDesc}</p>
                        </div>
                        {item.link && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            {item.link?.startsWith('http') ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                              >
                                {language === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}{' '}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  if (item.link) {
                                    onNavigate(item.link.replace('/', ''));
                                  }
                                }}
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                              >
                                {language === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}{' '}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'faq':
        return (
          <div key={section.id} className="py-14 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              {subtitle && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
                  {subtitle}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
              {content && (
                <p className="mt-2 text-slate-600 text-sm">{content}</p>
              )}
            </div>

            {section.items && section.items.length > 0 && (
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-base flex items-start gap-2.5">
                      <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      {getLocalizedField(item, 'title', language)}
                    </h3>
                    <p className="text-slate-600 text-sm mt-2.5 pl-7 leading-relaxed">
                      {getLocalizedField(item, 'description', language)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'cta':
        return (
          <div key={section.id} className="py-12 px-4 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 md:p-12 text-center shadow-lg border border-slate-700">
              {subtitle && (
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                  {subtitle}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
              {content && (
                <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                  {content}
                </p>
              )}
              {buttonText && (
                <div className="mt-6">
                  {section.buttonLink?.startsWith('http') ? (
                    <a
                      href={section.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-lg shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      {buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (section.buttonLink) {
                          onNavigate(section.buttonLink.replace('/', ''));
                        }
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-lg shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      {buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {sections.map(section => renderSection(section))}
    </div>
  );
};
