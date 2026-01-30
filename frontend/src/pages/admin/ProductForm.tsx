import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import CustomSelect from '../../components/ui/CustomSelect';
import ImageCropper from '../../components/ui/ImageCropper';

interface Category {
    id: number;
    name: string;
    children?: Category[];
}

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        description: '',
        price: '',
        stock: '',
        is_active: true,
        sort_order: ''
    });

    // Image Handling State
    // Image Handling State
    interface CombinedImage {
        uniqueId: string;
        type: 'existing' | 'new';
        file?: File; // Only for new
        preview: string;
        id?: number; // Only for existing
        is_primary: boolean;
        sort_order: number;
    }

    const [allImages, setAllImages] = useState<CombinedImage[]>([]);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]); // Track deleted images
    const [cropQueue, setCropQueue] = useState<File[]>([]);
    const [currentCropImage, setCurrentCropImage] = useState<{ src: string, name: string, isExistingId?: number, isNewIndex?: number } | null>(null);

    // Other State
    const [links, setLinks] = useState<{ site_name: string; url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
    const [sortPositions, setSortPositions] = useState<{ id: number, name: string, sort_order: number }[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, imageId: number | null }>({ isOpen: false, imageId: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories first
                const catRes = await api.get('/categories');
                const cats: Category[] = catRes.data;
                setCategories(cats);

                // Fetch Sort Positions
                const sortRes = await api.get('/products/sort-positions');
                setSortPositions(sortRes.data);

                // Fetch Product if editing
                if (id) {
                    const prodRes = await api.get(`/products/${id}`);
                    const p = prodRes.data;

                    setFormData({
                        name: p.name,
                        category_id: p.category_id,
                        description: p.description || '',
                        price: p.price,
                        stock: p.stock,
                        is_active: Boolean(p.is_active),
                        sort_order: p.sort_order || ''
                    });
                    if (p.links) setLinks(p.links);
                    if (p.links) setLinks(p.links);
                    if (p.images) {
                        const formattedImages: CombinedImage[] = p.images
                            .sort((a: any, b: any) => a.sort_order - b.sort_order)
                            .map((img: any) => ({
                                uniqueId: `existing-${img.id}`,
                                type: 'existing',
                                id: img.id,
                                preview: img.image_path,
                                is_primary: img.is_primary,
                                sort_order: img.sort_order
                            }));
                        setAllImages(formattedImages);
                    }

                    // Determine parent category
                    const parent = cats.find(c => c.id === Number(p.category_id));
                    if (parent) {
                        setSelectedParentCategory(String(parent.id));
                    } else {
                        // Check if it's a child
                        const parentOfChild = cats.find(c => c.children?.some(child => child.id === Number(p.category_id)));
                        if (parentOfChild) {
                            setSelectedParentCategory(String(parentOfChild.id));
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    // --- Image Cropper Logic ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setCropQueue(files);
        }
        e.target.value = ''; // Reset input
    };

    const handleEditExistingImage = (img: CombinedImage) => {
        // Explicitly strip the absolute domain if present to force relative URL
        const src = img.preview.replace('http://localhost:8081', '');

        setCurrentCropImage({
            src,
            name: `edited_image_${img.id}.jpg`,
            isExistingId: img.id
        });
    };

    const handleEditNewImage = (uniqueId: string) => {
        const img = allImages.find(i => i.uniqueId === uniqueId);
        if (!img || !img.file) return;

        // Create a FileReader to read the file back to data URL for cropping
        const reader = new FileReader();
        reader.onload = () => {
            setCurrentCropImage({
                src: reader.result as string,
                name: img.file!.name,
                isNewIndex: allImages.findIndex(i => i.uniqueId === uniqueId) // Use index as pointer for update
            });
        };
        reader.readAsDataURL(img.file);
    };

    useEffect(() => {
        if (!currentCropImage && cropQueue.length > 0) {
            const file = cropQueue[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCurrentCropImage({
                    src: reader.result as string,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    }, [cropQueue, currentCropImage]);

    const handleCropComplete = (croppedBlob: Blob) => {
        if (!currentCropImage) return;

        const newFile = new File([croppedBlob], currentCropImage.name, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(newFile);

        if (currentCropImage.isExistingId) {
            // Replaced an existing image
            // 1. Mark existing as deleted
            setDeletedImageIds(prev => [...prev, currentCropImage.isExistingId!]);

            // 2. Replace in allImages list at same position
            setAllImages(prev => prev.map(img => {
                if (img.id === currentCropImage.isExistingId) {
                    return {
                        uniqueId: `new-from-edit-${Date.now()}`,
                        type: 'new',
                        file: newFile,
                        preview: previewUrl,
                        is_primary: img.is_primary,
                        sort_order: img.sort_order // Keep sort order!
                    };
                }
                return img;
            }));

        } else if (currentCropImage.isNewIndex !== undefined) {
            // It was a new image being re-edited
            setAllImages(prev => {
                const updated = [...prev];
                const oldItem = updated[currentCropImage.isNewIndex!];
                updated[currentCropImage.isNewIndex!] = {
                    ...oldItem,
                    file: newFile,
                    preview: previewUrl
                };
                return updated;
            });
        } else {
            // Normal new upload flow
            // Add to end
            const newImageItem: CombinedImage = {
                uniqueId: `new-${Date.now()}-${Math.random()}`,
                type: 'new',
                file: newFile,
                preview: previewUrl,
                is_primary: false,
                sort_order: allImages.length // Append to end
            };
            setAllImages(prev => [...prev, newImageItem]);
            setCropQueue(prev => prev.slice(1));
        }

        setCurrentCropImage(null);
    };

    const handleCropCancel = () => {
        // If it was queue item, skip it. If edit, just close.
        if (!currentCropImage?.isExistingId && currentCropImage?.isNewIndex === undefined) {
            setCropQueue(prev => prev.slice(1));
        }
        setCurrentCropImage(null);
    };

    const removeImage = (uniqueId: string) => {
        const img = allImages.find(i => i.uniqueId === uniqueId);
        if (img && img.type === 'existing' && img.id) {
            setDeletedImageIds(prev => [...prev, img.id!]);
        }
        setAllImages(prev => prev.filter(i => i.uniqueId !== uniqueId));
    };

    // --- Link Logic ---
    const addLink = () => {
        setLinks([...links, { site_name: '', url: '' }]);
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: 'site_name' | 'url', value: string) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    // --- DND Logic ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem === null || draggedItem === index) return;

        // Reorder list visually during drag
        const newItems = [...allImages];
        const draggedImage = newItems[draggedItem];
        newItems.splice(draggedItem, 1);
        newItems.splice(index, 0, draggedImage);

        setDraggedItem(index);
        setAllImages(newItems);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const moveImage = (index: number, direction: 'prev' | 'next') => {
        if (direction === 'prev' && index === 0) return;
        if (direction === 'next' && index === allImages.length - 1) return;

        const newItems = [...allImages];
        const targetIndex = direction === 'prev' ? index - 1 : index + 1;

        // Swap
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        setAllImages(newItems);
    };

    // --- Delete Existing Image Logic ---
    const handleDeleteClick = (uniqueId: string) => {
        const img = allImages.find(i => i.uniqueId === uniqueId);
        if (img && img.type === 'existing') {
            // If it's existing, confirm before delete (optional, or just move to deletedIds immediately)
            // Sticking to modal for existing
            setDeleteModal({ isOpen: true, imageId: img.id! });
        } else {
            // New image, just remove
            removeImage(uniqueId);
        }
    };

    const confirmDeleteImage = async () => {
        if (!deleteModal.imageId) return;

        // Just add to deleted set and remove from visual list
        setDeletedImageIds(prev => [...prev, deleteModal.imageId!]);
        setAllImages(prev => prev.filter(img => img.id !== deleteModal.imageId));

        setDeleteModal({ isOpen: false, imageId: null });

        // Note: Previously we did API delete immediately. 
        // Be consistent: either all deletions happen on save, or clear on API immediately.
        // The previous code did API delete immediately. Let's keep that pattern if preferred, 
        // OR better: defer to Save for consistency with Drag and Drop.
        // PROPOSAL: Defer all to save. But user might expect immediate.
        // Let's defer to save for simpler State management with DND.
        // BUT the handleSubmit code processes deletedImageIds separately.
        // Reverting to immediate delete call as per previous implementation to avoid regression?
        // Actually, if I delete immediately, I must verify it's gone from server.
        // Let's just track it in deletedImageIds and do it on Save. Less network calls during edit.
    };

    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process deletions from edits
            for (const delId of deletedImageIds) {
                await api.delete(`/products/${id}/images/${delId}`);
            }
        } catch (e) { console.error("Error deleting edited images", e) }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category_id', formData.category_id);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('sort_order', formData.sort_order);

        // Append images with sort order
        const newUploads: File[] = [];

        allImages.forEach((img, globalIndex) => {
            const sortVal = globalIndex + 1;

            if (img.type === 'existing' && img.id) {
                data.append(`existing_images_sort[${img.id}]`, sortVal.toString());
            } else if (img.type === 'new' && img.file) {
                // It's a file to upload.
                const uploadIndex = newUploads.length;
                newUploads.push(img.file);
                // Map uploadIndex (in the files array) to the global sortVal
                data.append(`new_images_sort[${uploadIndex}]`, sortVal.toString());
            }
        });

        // Append actual files
        newUploads.forEach(file => {
            data.append('images[]', file);
        });

        // Append links
        links.forEach((link, index) => {
            if (link.site_name && link.url) {
                data.append(`links[${index}][site_name]`, link.site_name);
                data.append(`links[${index}][url]`, link.url);
            }
        });

        try {
            if (id) {
                data.append('_method', 'PUT');
                await api.post(`/products/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/yonetim/urunler');
        } catch (err) {
            console.error(err);
            alert('Ürün kaydedilemedi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/yonetim/urunler" className="text-gray-500 hover:text-black flex items-center gap-2 text-sm mb-4 transition">
                    &larr; Ürünlere Dön
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* INPUT FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Ürün Adı</label>
                                <input
                                    type="text"
                                    className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <CustomSelect
                                    label="Kategori"
                                    value={selectedParentCategory}
                                    onChange={(val) => {
                                        setSelectedParentCategory(val);
                                        setFormData(prev => ({ ...prev, category_id: val }));
                                    }}
                                    options={[
                                        { value: '', label: 'Ana Kategori Seçin' },
                                        ...categories.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                    placeholder="Ana Kategori Seçin"
                                    required
                                />

                                {(() => {
                                    const parent = categories.find(c => c.id === Number(selectedParentCategory));
                                    if (parent && parent.children && parent.children.length > 0) {
                                        return (
                                            <CustomSelect
                                                value={formData.category_id}
                                                onChange={(val) => setFormData({ ...formData, category_id: val })}
                                                options={[
                                                    { value: parent.id, label: 'Alt Kategori Seçin (Opsiyonel)' },
                                                    ...parent.children.map(child => ({ value: child.id, label: child.name }))
                                                ]}
                                                placeholder="Alt Kategori Seçin"
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Fiyat (₺)</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Stok Adedi</label>
                                <input
                                    type="number"
                                    className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Sıralama Sırası</label>
                                <input
                                    type="number"
                                    className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                    value={formData.sort_order}
                                    onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                                    placeholder="Otomatik sıralama için boş bırakın"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Açıklama</label>
                            <textarea
                                className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400 h-32"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* IMAGES */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görselleri</label>

                            {/* Unified Image Grid with Drag & Drop */}
                            {allImages.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Ürün Görselleri (Sıralamak için sürükleyip bırakın)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {allImages.map((img, idx) => (
                                            <div
                                                key={img.uniqueId}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragOver={(e) => handleDragOver(e, idx)}
                                                onDrop={handleDrop}
                                                onDragEnd={handleDragEnd}
                                                className={`relative aspect-[4/5] rounded-lg overflow-hidden border transition-all cursor-move group ${draggedItem === idx
                                                    ? 'opacity-50 border-blue-400 scale-95'
                                                    : 'border-gray-200 hover:border-black'
                                                    } ${img.type === 'new' ? 'ring-2 ring-green-500/20' : ''}`}
                                            >
                                                <img
                                                    src={img.preview.replace('http://localhost:8081', '')}
                                                    alt={`Product ${idx}`}
                                                    className="w-full h-full object-cover pointer-events-none"
                                                />

                                                {/* Mobile Sort Controls (Always visible on mobile / accessible in overlay) */}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); moveImage(idx, 'prev'); }}
                                                        disabled={idx === 0}
                                                        className={`p-1 rounded-full text-white ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/40'}`}
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>

                                                    {/* Central actions for mobile readability */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); img.type === 'existing' ? handleEditExistingImage(img) : handleEditNewImage(img.uniqueId); }}
                                                            className="p-1.5 bg-white text-black rounded-full"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(img.uniqueId); }}
                                                            className="p-1.5 bg-red-600 text-white rounded-full"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); moveImage(idx, 'next'); }}
                                                        disabled={idx === allImages.length - 1}
                                                        className={`p-1 rounded-full text-white ${idx === allImages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/40'}`}
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                                                    {img.is_primary && (
                                                        <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
                                                            Ana Resim
                                                        </span>
                                                    )}
                                                    {img.type === 'new' && (
                                                        <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
                                                            Yeni
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Sort Order Badge */}
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-white/90 backdrop-blur text-black text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm border border-gray-200">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-black transition cursor-pointer relative">
                                <input
                                    type="file" multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                            Dosya Yükle
                                        </span>
                                        <p className="pl-1">veya sürükleyip bırakın</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Otomatik olarak 4:5 oranında kırpılacaktır.</p>
                                </div>
                            </div>
                        </div>

                        {/* LINKS */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Satın Alma Linkleri</label>
                                <button type="button" onClick={addLink} className="text-sm text-indigo-600 hover:text-indigo-900">+ Link Ekle</button>
                            </div>
                            <div className="space-y-3">
                                {links.map((link, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Site Adı (Örn: WhatsApp)"
                                                className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                                value={link.site_name}
                                                onChange={e => updateLink(index, 'site_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <input
                                                type="url"
                                                placeholder="URL (https://...)"
                                                className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                                                value={link.url}
                                                onChange={e => updateLink(index, 'url', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLink(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                {links.length === 0 && <p className="text-sm text-gray-400 italic">Henüz link eklenmedi.</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${formData.is_active ? 'bg-black' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                Ürün Satışta {formData.is_active ? '(Aktif)' : '(Pasif)'}
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 flex justify-center"
                            >
                                {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Mevcut Sıralama</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Ürünler bu sıraya göre listelenir. Dolu bir sırayı seçerseniz diğer ürünler kaydırılır.
                        </p>

                        <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {sortPositions.map((pos) => (
                                <div
                                    key={pos.id}
                                    className={`p-3 rounded-lg border text-sm flex gap-3 items-center ${(id && Number(id) === pos.id)
                                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="font-mono font-bold bg-white w-8 h-8 flex items-center justify-center rounded border border-gray-200">
                                        {pos.sort_order}
                                    </span>
                                    <span className="truncate font-medium text-gray-700">
                                        {pos.name}
                                    </span>
                                    {(id && Number(id) === pos.id) && (
                                        <span className="ml-auto text-blue-600 text-xs font-bold px-2 py-1 bg-blue-100 rounded">
                                            BU ÜRÜN
                                        </span>
                                    )}
                                </div>
                            ))}
                            {sortPositions.length === 0 && (
                                <p className="text-gray-500 text-sm italic">Henüz ürün yok.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {currentCropImage && (
                <ImageCropper
                    imageSrc={currentCropImage.src}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={4 / 5}
                />
            )}

            {
                deleteModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Görseli Sil</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Bu görseli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteModal({ isOpen: false, imageId: null })}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDeleteImage}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Evet, Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
