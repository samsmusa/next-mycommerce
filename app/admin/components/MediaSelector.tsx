import * as React from "react"
import {Check, Loader2, Search, Upload, X} from "lucide-react"
import {Control, FieldValues, Path} from "react-hook-form"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {ScrollArea} from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Media} from "@/app/types/media";
import {getMediaByName, uploadMedia} from "@/app/server_action/media";


interface MediaSelectorProps<T extends FieldValues> {
    control: Control<T>
    fieldName: Path<T>
    label?: string
    description?: string
    multiple?: boolean
    accept?: string
    maxItems?: number
    onMediaSelect?: (media: Media[] | Media | null) => void
    isLoading?: boolean
    onSearch?: (query: string) => Promise<Media[]>
}

interface MediaGridProps {
    media: Media[]
    selected: string[]
    onSelect: (id: string) => void
    multiple: boolean
    isLoading?: boolean
}

// Media Grid Component
function MediaGrid({media, selected, onSelect, multiple, isLoading}: MediaGridProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400"/>
            </div>
        )
    }

    if (media.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                <p>No media found</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {media.map((item) => {
                const isSelected = selected.includes(item.id)
                const isImage = item.mimeType.startsWith("image/")

                return (
                    <div
                        key={item.id}
                        onClick={() => {
                            if (multiple) {
                                onSelect(item.id)
                            } else if (!isSelected) {
                                onSelect(item.id)
                            } else {
                                onSelect(item.id)
                            }
                        }}
                        className={`relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                            isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300 bg-slate-50"
                        }`}
                    >
                        {/* Media Preview */}
                        {isImage ? (
                            <img
                                src={item.url}
                                alt={item.alt || item.originalName}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%23334155' text-anchor='middle' dy='.3em'%3EError%3C/text%3E%3C/svg%3E"
                                }}
                            />
                        ) : (
                            <div className="w-full h-32 bg-slate-200 flex items-center justify-center">
                                <div className="text-center">
                                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1"/>
                                    <span className="text-xs text-slate-500">File</span>
                                </div>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        } ${isSelected ? "bg-blue-500/20" : "bg-black/20"}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                    ? "bg-blue-500 border-blue-600"
                                    : "bg-white/90 border-white"
                            }`}>
                                {isSelected && <Check className="h-4 w-4 text-white"/>}
                            </div>
                        </div>

                        {/* Filename Tooltip */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white truncate font-medium">{item.originalName}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Media Info Panel
function MediaInfoPanel({media}: { media: Media | null }) {
    if (!media) {
        return (
            <div className="text-center text-slate-500 py-8">
                <p>Select media to view details</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 text-sm">
            {media.url && media.mimeType.startsWith("image/") && (
                <img
                    src={media.url}
                    alt={media.alt}
                    className="w-full h-40 object-cover rounded-lg border border-slate-200"
                />
            )}

            <div className="space-y-3">
                <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Name</p>
                    <p className="font-medium text-slate-900 truncate">{media.originalName}</p>
                </div>

                {media.alt && (
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Alt Text</p>
                        <p className="text-slate-700">{media.alt}</p>
                    </div>
                )}

                {media.description && (
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Description</p>
                        <p className="text-slate-700 line-clamp-3">{media.description}</p>
                    </div>
                )}

                {media.width && media.height && (
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Dimensions</p>
                        <p className="text-slate-700">{media.width}×{media.height}px</p>
                    </div>
                )}

                <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Size</p>
                    <p className="text-slate-700">{(media.size / 1024 / 1024).toFixed(2)}MB</p>
                </div>

                {media.tags && media.tags.length > 0 && (
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                            {media.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


// Main Media Selector Component
export function MediaSelector<T extends FieldValues>({
                                                         control,
                                                         fieldName,
                                                         label = "Media",
                                                         description,
                                                         multiple = false,
                                                         accept = "image/*",
                                                         maxItems = multiple ? 10 : 1,
                                                         onMediaSelect,
                                                         isLoading = false
                                                     }: MediaSelectorProps<T>) {
    const [open, setOpen] = React.useState(false)
    const [allMedia, setAllMedia] = React.useState<Media[]>([])
    const [searchResults, setSearchResults] = React.useState<Media[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedInfo, setSelectedInfo] = React.useState<Media | null>(null)
    const [uploading, setUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Fetch initial media
    React.useEffect(() => {
        if (open && allMedia.length === 0) {
            handleSearch("").then(r => r && setAllMedia(r)).catch(() => {
            })
        }
    }, [open])

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        try {
            const results = await getMediaByName(query)
            console.log("results", results)
            setSearchResults(results.data)
            return results.data
        } catch (error) {
            console.error("Search failed:", error)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileName = file.name
            const newMedia = await uploadMedia(file, fileName, "cmj8e1loe00003ucr0cnr3rs1", {alt: "hi"})
            setAllMedia((prev) => [newMedia, ...prev])
            setSearchResults((prev) => [newMedia, ...prev])
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const displayMedia = searchQuery ? searchResults : allMedia

    return (
        <FormField
            control={control}
            name={fieldName}
            render={({field}) => {

                const value = field.value as string | string[] | undefined;

                const selectedIds: string[] = Array.isArray(value)
                    ? value
                    : value
                        ? [value]
                        : [];

                const selectedMediaItems = displayMedia.filter((m) =>
                    selectedIds.includes(m.id)
                );

                const handleSelectMedia = (id: string) => {
                    let newValue: string | string[]

                    if (multiple) {
                        newValue = selectedIds.includes(id)
                            ? selectedIds.filter((sid) => sid !== id)
                            : selectedIds.concat(id)
                    } else {
                        newValue = selectedIds.includes(id) ? "" : id
                    }

                    field.onChange(newValue)
                    onMediaSelect?.(
                        Array.isArray(newValue)
                            ? displayMedia.filter((m) => (newValue as string[]).includes(m.id))
                            : displayMedia.find((m) => m.id === newValue) || null
                    )

                    if (!multiple) {
                        setOpen(false)
                    }
                }

                return (
                    <FormItem>
                        <FormLabel className="text-sm font-semibold">{label}</FormLabel>
                        {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal h-auto py-3"
                                >
                                    {selectedIds.length === 0 ? (
                                        <span className="text-slate-500">Select media...</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMediaItems.map((media) => (
                                                <Badge key={media.id} variant="secondary" className="text-xs">
                                                    {media.originalName}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSelectMedia(media.id)
                                                        }}
                                                        className="ml-1 hover:text-red-600"
                                                    >
                                                        <X className="h-3 w-3"/>
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="flex flex-col">

                                <DialogHeader>
                                    <DialogTitle>
                                        {multiple ? "Select Media (Multiple)" : "Select Media"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Search or upload media to
                                        select. {multiple && selectedIds.length > 0 && `(${selectedIds.length}/${maxItems} selected)`}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
                                    {/* Main Content */}
                                    <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
                                        {/* Search Bar */}
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                                <Input
                                                    placeholder="Search media..."
                                                    value={searchQuery}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept={accept}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                            >
                                                {uploading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    <Upload className="h-4 w-4"/>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Media Grid */}
                                        <ScrollArea className="flex-1 rounded-lg border border-slate-200 bg-white p-4">
                                            <MediaGrid
                                                media={displayMedia}
                                                selected={selectedIds}
                                                onSelect={handleSelectMedia}
                                                multiple={multiple}
                                                isLoading={isLoading}
                                            />
                                        </ScrollArea>
                                    </div>

                                    {/* Sidebar - Media Info */}
                                    <div className="lg:col-span-1 flex flex-col">
                                        <div
                                            className="border border-slate-200 rounded-lg p-4 bg-slate-50 overflow-y-auto">
                                            <MediaInfoPanel
                                                media={
                                                    selectedIds.length === 1
                                                        ? displayMedia.find((m) => m.id === selectedIds[0]) || null
                                                        : selectedInfo
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                    <p className="text-sm text-slate-600">
                                        {selectedIds.length} {multiple ? "media" : "item"} selected
                                    </p>
                                    <Button onClick={() => setOpen(false)}>Done</Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <FormMessage/>
                    </FormItem>
                )
            }}
        />
    )
}

