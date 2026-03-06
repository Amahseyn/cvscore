import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Check, X, Filter } from 'lucide-react';

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    experienceRange: [number, number];
    setExperienceRange: (range: [number, number]) => void;
    seniorityLevels: string[];
    selectedSeniority: string[];
    setSelectedSeniority: (levels: string[]) => void;
    minScore: number;
    setMinScore: (score: number) => void;
    locationSearch: string;
    setLocationSearch: (loc: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    searchTerm,
    setSearchTerm,
    experienceRange,
    setExperienceRange,
    seniorityLevels,
    selectedSeniority,
    setSelectedSeniority,
    minScore,
    setMinScore,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleSeniority = (level: string) => {
        if (selectedSeniority.includes(level)) {
            setSelectedSeniority(selectedSeniority.filter(l => l !== level));
        } else {
            setSelectedSeniority([...selectedSeniority, level]);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 -mx-8 px-8 py-6 mb-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search candidates..."
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-xs font-bold focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                        />
                    </div>

                    {/* Quick Location Filter in Header Row */}
                    <div className="relative flex-1 group w-full md:w-1/4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            placeholder="Location..."
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-xs font-bold focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Sort</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
                        >
                            <option value="score">Neural Match</option>
                            <option value="experience">Experience</option>
                            <option value="impact">Impact</option>
                            <option value="technical">Technical</option>
                        </select>

                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-3 rounded-xl border transition-all ${isFilterOpen ? 'bg-brand-500 text-white border-brand-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-brand-500'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {isFilterOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-slate-50 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Experience Filter */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Experience (Years)</label>
                                <span className="text-[10px] font-black text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md">
                                    {experienceRange[0]} - {experienceRange[1]}+
                                </span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={experienceRange[0]}
                                    onChange={(e) => setExperienceRange([parseInt(e.target.value), experienceRange[1]])}
                                    className="w-full accent-brand-500"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={experienceRange[1]}
                                    onChange={(e) => setExperienceRange([experienceRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-brand-500"
                                />
                            </div>
                        </div>

                        {/* Seniority Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Seniority</label>
                            <div className="flex flex-wrap gap-2">
                                {seniorityLevels.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => toggleSeniority(level)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${selectedSeniority.includes(level)
                                            ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-brand-500/30'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Score Threshold Filter */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Min Neural Score</label>
                                <span className="text-[10px] font-black text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md">
                                    {minScore}%+
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={minScore}
                                onChange={(e) => setMinScore(parseInt(e.target.value))}
                                className="w-full accent-brand-500"
                            />
                        </div>
                    </div>
                )}

                {/* Active Filters Summary */}
                <div className="flex flex-wrap gap-3 pt-2 items-center">
                    <div className="flex gap-2 mr-4 border-r border-slate-100 dark:border-slate-800 pr-4">
                        <button
                            onClick={() => setSelectedSeniority(["Senior", "Lead", "Director"])}
                            className="text-[9px] font-black text-slate-500 hover:text-brand-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 transition-all"
                        >
                            🚀 Senior Only
                        </button>
                        <button
                            onClick={() => setExperienceRange([5, 20])}
                            className="text-[9px] font-black text-slate-500 hover:text-brand-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 transition-all"
                        >
                            ⏳ Experienced
                        </button>
                    </div>

                    {(selectedSeniority.length > 0 || experienceRange[0] > 0 || experienceRange[1] < 20 || minScore > 0 || locationSearch) && (
                        <>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Active:</span>
                            {selectedSeniority.map(level => (
                                <span key={level} className="flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-md text-[9px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                    {level}
                                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => toggleSeniority(level)} />
                                </span>
                            ))}
                            {(experienceRange[0] > 0 || experienceRange[1] < 20) && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-md text-[9px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                    {experienceRange[0]} - {experienceRange[1]}y
                                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setExperienceRange([0, 20])} />
                                </span>
                            )}
                            {minScore > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-md text-[9px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                    Score: {minScore}%+
                                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setMinScore(0)} />
                                </span>
                            )}
                            {locationSearch && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-md text-[9px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                                    Loc: {locationSearch}
                                    <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setLocationSearch("")} />
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedSeniority([]);
                                    setExperienceRange([0, 20]);
                                    setMinScore(0);
                                    setLocationSearch("");
                                    setSearchTerm("");
                                }}
                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline ml-2"
                            >
                                Clear All
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
