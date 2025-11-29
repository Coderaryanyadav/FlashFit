'use client';

interface GenderSelectorProps {
  selected: 'man' | 'woman';
  onChange: (gender: 'man' | 'woman') => void;
}

export default function GenderSelector({ selected, onChange }: GenderSelectorProps) {
  return (
    <div className="flex gap-3 px-4 py-3 bg-black">
      <button
        onClick={() => onChange('man')}
        className={`flex-1 flex items-center gap-3 p-3 rounded-lg transition-all ${
          selected === 'man'
            ? 'border-2 border-blue-500 bg-gray-900'
            : 'border-2 border-gray-700 bg-gray-900 hover:border-gray-600'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        </div>
        <span className={`font-semibold ${selected === 'man' ? 'text-blue-400' : 'text-gray-400'}`}>
          MAN
        </span>
      </button>
      
      <button
        onClick={() => onChange('woman')}
        className={`flex-1 flex items-center gap-3 p-3 rounded-lg transition-all ${
          selected === 'woman'
            ? 'border-2 border-blue-500 bg-gray-900'
            : 'border-2 border-gray-700 bg-gray-900 hover:border-gray-600'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center overflow-hidden">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        </div>
        <span className={`font-semibold ${selected === 'woman' ? 'text-blue-400' : 'text-gray-400'}`}>
          WOMAN
        </span>
      </button>
    </div>
  );
}
