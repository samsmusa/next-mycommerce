import React, { useEffect, useRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { CheckCircle2, FileText, Image as ImageIcon, Info, Loader2, Plus, Search, Upload, X } from 'lucide-react';
import Image from "next/image";
import {getMediaByName, uploadMedia} from "@/app/server_action/media";
import {ProductMedia} from "@/app/types/product";
import {Media} from "@/app/types/media";
// import {ProductMediaMaxAggregateOutputType as ProductMedia} from "@/prisma/prisma/models/ProductMedia";

interface MediaSelectorProps {
    control: any;
    name: string;
    multiple?: boolean;
    label?: string;
    maxFiles?: number;
    isPrimary?: boolean; // For single cover image selection
    onPrimaryChange?: (mediaId: string) => void;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
                                                         control,
                                                         name,
                                                         multiple = false,
                                                         label = "Select Media",
                                                         maxFiles = 10,
                                                         isPrimary = false,
                                                         onPrimaryChange,
                                                     }) => {
    const {
        field: { value, onChange },
        fieldState: { error }
    } = useController({
        name,
        control,
        defaultValue: multiple ? [] : null
    });

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [library, setLibrary] = useState<Media[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (isOpen) {
            handleSearch('');
        }
    }, [isOpen]);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const results = await getMediaByName(query)
            setLibrary(results.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const filesToUpload = multiple ? Array.from(files) : [files[0]];

        setIsUploading(true);
        try {
            const uploadedItems: Media[] = [];

            for (const file of filesToUpload) {
                try {
                    const uploadedItem = await uploadMedia(file, file.name, "cmj8e1loe00003ucr0cnr3rs1", {
                        alt: file.name
                    });
                    uploadedItems.push(uploadedItem);
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                }
            }

            setLibrary(prev => [...uploadedItems, ...prev]);
            setActiveTab('library');

            if (uploadedItems.length > 0) {
                if (!multiple) {
                    onChange(uploadedItems[0]);
                    setPrimaryMediaId(uploadedItems[0].id);
                    setIsOpen(false);
                } else {
                    const currentSelection = (value as ProductMedia[]) || [];
                    const newSelection = [...uploadedItems, ...currentSelection].slice(0, maxFiles);
                    onChange(newSelection);
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleItemSelection = (item: Media) => {
        if (multiple) {
            const currentSelection = (value as Media[]) || [];
            const isSelected = currentSelection.some(i => i.id === item.id);

            if (isSelected) {
                onChange(currentSelection.filter(i => i.id !== item.id));
            } else {
                if (currentSelection.length < maxFiles) {
                    onChange([...currentSelection, item]);
                }
            }
        } else {
            onChange(item.id);
            setPrimaryMediaId(item.id);
            if (onPrimaryChange) onPrimaryChange(item.id as string);
            setIsOpen(false);
        }
    };

    const setPrimaryMedia = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPrimaryMediaId(id);
        if (onPrimaryChange) onPrimaryChange(id);
    };

    const removeItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple) {
            const currentSelection = (value as ProductMedia[]) || [];
            onChange(currentSelection.filter(i => i.id !== id));
            if (primaryMediaId === id) setPrimaryMediaId(null);
        } else {
            onChange(null);
            setPrimaryMediaId(null);
        }
    };

    const isSelected = (id: string) => {
        if (multiple) {
            return ((value as ProductMedia[]) || []).some(i => i.id === id);
        }
        return (value as ProductMedia)?.id === id;
    };

    const selectedItems = multiple ? (value as ProductMedia[]) || [] : (value ? [value as ProductMedia] : []);
    const selectedCount = selectedItems.length;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">{label}</label>

            {/* Selected Items Preview */}
            <div className="flex flex-wrap gap-3">
                {selectedItems.map((item) => (
                    <div
                        key={item.id}
                        className={`relative group w-36 h-24 rounded-lg overflow-hidden border-2 bg-gray-50 flex items-center justify-center ${
                            primaryMediaId === item.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                        }`}
                    >
                        {item.media?.url ? (
                            <Image
                                src={item.media.url}
                                alt={item.media.filename || ""}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FileText className="w-8 h-8 text-gray-400" />
                        )}

                        {/* Primary Badge */}
                        {multiple && primaryMediaId === item.id && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                                Primary
                            </div>
                        )}

                        {/* Actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {multiple && (
                                <button
                                    onClick={(e) => setPrimaryMedia(item.id, e)}
                                    className={`p-2 rounded-full transition-colors ${
                                        primaryMediaId === item.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-600 hover:bg-blue-50'
                                    }`}
                                    title="Set as primary"
                                >
                                    <ImageIcon size={16} />
                                </button>
                            )}
                            <button
                                onClick={(e) => removeItem(item.id, e)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {(!multiple && !value) || (multiple && selectedCount < maxFiles) ? (
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="w-36 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-500 hover:text-blue-600"
                    >
                        <Plus size={24} />
                        <span className="text-[10px] mt-1 font-medium">Add Media</span>
                    </button>
                ) : null}
            </div>

            {error && <p className="text-xs text-red-500">{error.message}</p>}

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Media Library</h3>
                                <p className="text-sm text-gray-500">
                                    {multiple ? `Select up to ${maxFiles} items` : 'Choose a file'}
                                    {selectedCount > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {selectedCount} selected
                    </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs & Search */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center bg-gray-50 border-b border-gray-100">
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                                <button
                                    onClick={() => setActiveTab('library')}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        activeTab === 'library'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Browse
                                </button>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        activeTab === 'upload'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Upload New
                                </button>
                            </div>

                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search media..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
                            {activeTab === 'library' ? (
                                <>
                                    {isSearching ? (
                                        <div className="flex flex-col items-center justify-center h-full py-12">
                                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                            <p className="text-gray-500 font-medium">Scanning your library...</p>
                                        </div>
                                    ) : library.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {library.map((item) => {
                                                const active = isSelected(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleItemSelection(item)}
                                                        className={`relative group cursor-pointer aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                                                            active
                                                                ? 'border-blue-600 ring-4 ring-blue-100 shadow-lg'
                                                                : 'border-gray-100 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {item?.url ? (
                                                            <Image
                                                                src={item.url}
                                                                alt={item.filename}
                                                                width={200}
                                                                height={200}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4">
                                                                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                                                                <span className="text-[10px] text-center text-gray-600 font-medium truncate w-full">
                                  {item?.filename}
                                </span>
                                                            </div>
                                                        )}

                                                        {/* Selection Overlay */}
                                                        {active && (
                                                            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                                                <div className="bg-blue-600 text-white rounded-full p-1.5 shadow-xl">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Hover info */}
                                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform p-2">
                                                            <p className="text-white text-[10px] truncate font-medium">
                                                                {item?.filename}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                            <ImageIcon size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No media found</p>
                                            <p className="text-sm">Try a different search or upload something new.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full max-w-md border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                            isUploading
                                                ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                                : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                                <p className="text-blue-700 font-bold text-lg animate-pulse">Processing files...</p>
                                                <p className="text-blue-500 text-sm mt-1">Optimizing and analyzing your media.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-blue-100 p-6 rounded-full text-blue-600 mb-6">
                                                    <Upload size={40} />
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-2">Drag & Drop or Click</h4>
                                                <p className="text-gray-500 text-center mb-6">
                                                    Upload high-resolution images, videos, or documents.
                                                    Supported types: JPG, PNG, GIF, MP4, PDF.
                                                </p>
                                                <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                                    Browse Files
                                                </button>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            multiple={multiple}
                                            onChange={handleFileChange}
                                            accept="image/*,video/*,application/pdf"
                                            disabled={isUploading}
                                        />
                                    </div>

                                    <div className="mt-12 flex items-start gap-3 max-w-lg bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                                            <Info size={18} />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-gray-900">Media Organization</h5>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                Upload your media and organize them by marking one as primary for product covers and featured images. All media is securely stored and easily searchable.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                                {multiple && primaryMediaId && (
                                    <span className="ml-2 text-blue-600 font-semibold">
                    • Primary: {library.find(i => i.id === primaryMediaId)?.media?.filename}
                  </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-8 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaSelector;