import React, { useState } from 'react';
import { CHORD_LIBRARY } from '../../data/courseData';
import { ChordDiagram } from '../Common/ChordDiagram';
import { Search, Music, Sparkles } from 'lucide-react';

export const ChordLibraryExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Abierto', 'Cejilla', 'Séptima', 'Power Chord', 'Extendido'];

  const chordList = Object.entries(CHORD_LIBRARY).map(([key, chord]) => ({
    key,
    ...chord
  }));

  const filteredChords = chordList.filter(chord => {
    const matchesSearch =
      chord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chord.key.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || chord.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Music className="w-5 h-5 text-amber-400" /> Diccionario Armónico de Acordes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagramas interactivos de digitación y reproducción de sonido para todos los niveles.
          </p>
        </div>

        {/* Search and filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar acorde..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chords Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredChords.map(chord => (
          <ChordDiagram key={chord.key} chord={chord} size="md" />
        ))}
      </div>

      {filteredChords.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No se encontraron acordes con ese filtro.</p>
        </div>
      )}
    </div>
  );
};
