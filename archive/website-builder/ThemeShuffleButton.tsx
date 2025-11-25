import { useState, useRef, useEffect } from 'react';
import { Sparkles, Save, History, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { generateRandomTheme, saveThemePreset, SavedTheme, ThemeGenerationOptions } from '../../lib/theme-generator';

export default function ThemeShuffleButton() {
    const { setCustomTheme, savedThemes, revertToTheme } = useTheme();
    const [isShuffling, setIsShuffling] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [settings, setSettings] = useState<ThemeGenerationOptions>({
        harmony: 'random',
        mode: 'random',
        baseColor: undefined
    });
    const historyRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close history dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setShowHistory(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        if (showHistory || showSettings) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showHistory, showSettings]);

    const handleShuffle = () => {
        setIsShuffling(true);

        // Generate and apply new theme
        const newTheme = generateRandomTheme(settings);
        setCustomTheme(newTheme);

        // Auto-save to history
        saveThemePreset(newTheme);

        // Reset shuffling state after animation
        setTimeout(() => setIsShuffling(false), 1000);

        console.log('🎨 Theme shuffled:', newTheme.name);
    };

    const handleSave = () => {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleRevert = (themeId: string) => {
        revertToTheme(themeId);
        setShowHistory(false);
        console.log('↩️ Reverted to theme:', themeId);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative flex gap-2">
            {/* Main Button Group */}
            <div className="flex items-center gap-2" ref={historyRef}>
                {/* Shuffle Button */}
                <motion.button
                    onClick={handleShuffle}
                    disabled={isShuffling}
                    className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                        <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span>Shuffle Theme</span>

                    {/* Pulse effect during shuffle */}
                    {isShuffling && (
                        <motion.div
                            className="absolute inset-0 rounded-lg bg-white opacity-20"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </motion.button>

                {/* Save Success Indicator */}
                <AnimatePresence>
                    {showSaveSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                        >
                            <Save className="w-4 h-4" />
                            Saved!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Button */}
                <motion.button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Theme History"
                >
                    <History className="w-4 h-4" />
                    {savedThemes.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                            {Math.min(savedThemes.length, 9)}
                        </span>
                    )}
                </motion.button>
            </div>

            {/* Settings Button */}
            <div className="relative" ref={settingsRef}>
                <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Theme Settings"
                >
                    <Settings className="w-4 h-4" />
                </motion.button>

                {/* Settings Popover */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Theme Settings</h3>
                                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Base Color */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Base Brand Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={settings.baseColor || '#3B82F6'}
                                            onChange={(e) => setSettings({ ...settings, baseColor: e.target.value })}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <button
                                            onClick={() => setSettings({ ...settings, baseColor: undefined })}
                                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                                        >
                                            Reset to Random
                                        </button>
                                    </div>
                                </div>

                                {/* Harmony Rule */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Color Harmony
                                    </label>
                                    <select
                                        value={settings.harmony}
                                        onChange={(e) => setSettings({ ...settings, harmony: e.target.value as any })}
                                        className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-700 rounded text-sm border-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="random">Random</option>
                                        <option value="complementary">Complementary (High Contrast)</option>
                                        <option value="analogous">Analogous (Harmonious)</option>
                                        <option value="monochromatic">Monochromatic (Subtle)</option>
                                        <option value="triadic">Triadic (Vibrant)</option>
                                    </select>
                                </div>

                                {/* Mode */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Theme Mode
                                    </label>
                                    <select
                                        value={settings.mode}
                                        onChange={(e) => setSettings({ ...settings, mode: e.target.value as any })}
                                        className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-700 rounded text-sm border-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="random">Random</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* History Dropdown (Re-attached to main group logic but rendered here for z-index) */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-12 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                Theme History
                            </h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Theme List */}
                        <div className="max-h-96 overflow-y-auto">
                            {savedThemes.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                    No saved themes yet. Click "Shuffle Theme" to generate one!
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {savedThemes.map((saved: SavedTheme, index: number) => (
                                        <motion.button
                                            key={saved.id}
                                            onClick={() => handleRevert(saved.theme.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {/* Color Preview */}
                                            <div className="flex gap-1">
                                                <div
                                                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                                                    style={{ backgroundColor: saved.theme.colors.primary }}
                                                />
                                                <div
                                                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                                                    style={{ backgroundColor: saved.theme.colors.accent }}
                                                />
                                            </div>

                                            {/* Theme Info */}
                                            <div className="flex-grow min-w-0">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {saved.name}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatTime(saved.timestamp)}
                                                </div>
                                            </div>

                                            {/* Hover indicator */}
                                            <div className="text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <History className="w-4 h-4" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
