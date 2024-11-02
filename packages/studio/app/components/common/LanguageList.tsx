import { Link } from '@remix-run/react';
import React from 'react';
import { cn } from '~/lib/utils';
import { Badge } from '../ui/badge';

interface LanguageProps {
  allLanguages: string[];
  defaultLanguage: string;
  currentLanguage: string;
}
export const LanguageList: React.FC<LanguageProps> = React.memo((props) => {
  return (
    <div className="flex flex-col px-4 py-2 gap-1">
      {props.allLanguages.map((language) => (
        <Link key={language} to={language}>
          <button
            className={cn(
              'w-full px-4 py-2 rounded-md hover:bg-gray-200 relative',
              props.currentLanguage === language ? 'bg-gray-200' : ''
            )}
          >
            {language}

            {props.defaultLanguage === language && (
              <Badge className="absolute left-2" variant="secondary">
                Default
              </Badge>
            )}
          </button>
        </Link>
      ))}
    </div>
  );
});
LanguageList.displayName = 'LanguageList';
