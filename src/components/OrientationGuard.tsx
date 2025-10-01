'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrientationGuardProps {
  children: React.ReactNode;
}

export function OrientationGuard({ children }: OrientationGuardProps) {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = width <= 768; // Considera mobile até 768px
      const isPortraitMode = height > width;
      
      setIsMobile(isMobileDevice);
      setIsPortrait(isPortraitMode && isMobileDevice);
    };

    // Verificação inicial
    checkOrientation();

    // Listeners para mudanças de orientação e redimensionamento
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const handleRotateClick = () => {
    // Tenta forçar a rotação usando a Screen Orientation API
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        // Tipagem mais específica para a Screen Orientation API
        const orientation = window.screen.orientation as ScreenOrientation & {
          lock?: (orientation: string) => Promise<void>;
        };
        
        if (orientation.lock) {
          orientation.lock('landscape').catch(() => {
            // Se falhar, mostra um alerta
            alert(t('rotate_device'));
          });
        } else {
          alert(t('rotate_device'));
        }
      } catch {
        // Removido a variável 'error' não utilizada
        alert(t('rotate_device'));
      }
    } else {
      alert(t('rotate_device'));
    }
  };

  // Se não é mobile ou não está em portrait, mostra o conteúdo normalmente
  if (!isMobile || !isPortrait) {
    return <>{children}</>;
  }

  // Se é mobile e está em portrait, mostra o aviso de rotação
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="mb-6">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <Smartphone className="w-20 h-20 text-gray-400 transform rotate-90" />
            <RotateCcw className="w-8 h-8 text-blue-600 absolute -top-2 -right-2 animate-spin" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {t('rotate_device')}
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('landscape_required')}
        </p>
        
        <button
          onClick={handleRotateClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-5 h-5 inline-block mr-2" />
          {t('rotate_automatically')}
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Poke-Code</p>
        </div>
      </div>
    </div>
  );
}