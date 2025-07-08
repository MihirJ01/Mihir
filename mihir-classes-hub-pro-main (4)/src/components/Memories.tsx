import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Video, ThumbsUp, Upload, MoreVertical, Trash2, CheckCircle, ArrowUp, ArrowDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export function Memories({ isUserView = false }: { isUserView?: boolean } = {}) {
  const { isAdmin, user } = useAuth();
  const { data: videos = [], addItem: addVideo, refetch } = useSupabaseData("videos", { column: "created_at", ascending: false });
  const { data: likes = [], addItem: addLike } = useSupabaseData("video_likes");
  const { data: albums = [], addItem: addAlbum } = useSupabaseData("albums", { column: "created_at", ascending: false });
  const { data: albumMedia = [], addItem: addAlbumMedia, deleteItem: deleteAlbumMedia } = useSupabaseData("album_media", { column: "created_at", ascending: false });
  const [showUpload, setShowUpload] = useState(false);
  const { updateItem: updateAlbum, deleteItem: deleteAlbum } = useSupabaseData("albums");
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear().toString(),
    video: null as File | null,
    thumbnail: null as File | null,
  });
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [albumForm, setAlbumForm] = useState({ name: "", description: "", cover: null as File | null });
  const [coverUrl, setCoverUrl] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [editAlbumForm, setEditAlbumForm] = useState({ name: "", description: "", cover: null as File | null, link: "" });
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [draggingAlbumId, setDraggingAlbumId] = useState<string | null>(null);
  const [dragOverDustbin, setDragOverDustbin] = useState(false);
  const [heartAnims, setHeartAnims] = useState<{ [id: string]: boolean }>({});
  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [reelIndex, setReelIndex] = useState<number>(0);
  const reelVideos = videos;
  const reelModalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [fabOpen, setFabOpen] = useState(false);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, bucket: string) => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: false });
    setUploading(false);
    if (error) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data?.publicUrl || "";
  };

  // Handle video upload
  const handleUpload = async () => {
    if (!form.title || !form.year || !form.video) return;
    setUploading(true);
    let video_url = videoUrl;
    let thumbnail_url = thumbnailUrl;
    if (form.video) video_url = await uploadFile(form.video, "videos");
    if (form.thumbnail) thumbnail_url = await uploadFile(form.thumbnail, "videos");
    await addVideo({
      title: form.title,
      description: form.description,
      video_url,
      thumbnail_url,
      duration_seconds: 0, // Could be set with a video parser
      uploaded_by: user?.name || "",
      likes_count: 0,
      year: form.year,
    });
    setForm({ title: "", description: "", year: new Date().getFullYear().toString(), video: null, thumbnail: null });
    setVideoUrl("");
    setThumbnailUrl("");
    setShowUpload(false);
    setUploading(false);
  };

  // Like a video
  const handleLike = async (video_id: string) => {
    if (!user) return;
    // Prevent duplicate likes
    if (likes.some((like: any) => like.video_id === video_id && like.user_id === user.name)) return;
    await addLike({ video_id, user_id: user.name });
  };

  // Group videos by year
  const videosByYear = videos.reduce((acc: any, video: any) => {
    const y = video.year || "Other";
    if (!acc[y]) acc[y] = [];
    acc[y].push(video);
    return acc;
  }, {});
  const sortedYears = Object.keys(videosByYear).sort((a, b) => b.localeCompare(a));

  // Handle album creation
  const handleCreateAlbum = async () => {
    if (!albumForm.name) return;
    setCreatingAlbum(true);
    try {
      let cover_url = coverUrl;
      if (albumForm.cover) cover_url = await uploadFile(albumForm.cover, "videos");
      const result = await addAlbum({
        name: albumForm.name,
        description: albumForm.description,
        cover_url,
      });
      if (result) {
        setAlbumForm({ name: "", description: "", cover: null });
        setCoverUrl("");
        setShowCreateAlbum(false);
      }
    } finally {
      setCreatingAlbum(false);
    }
  };

  // Album view logic
  const openAlbum = (albumId: string) => setSelectedAlbum(albumId);
  const closeAlbum = () => setSelectedAlbum(null);
  const currentAlbum = albums.find((a: any) => a.id === selectedAlbum);
  const currentMedia = albumMedia.filter((m: any) => m.album_id === selectedAlbum);

  const handleSelectAlbum = (id: string) => {
    setSelectedAlbums(prev => prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!reelModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') setReelIndex(i => Math.min(i + 1, reelVideos.length - 1));
      if (e.key === 'ArrowUp' || e.key === 'w') setReelIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Escape') setReelModalOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reelModalOpen, reelVideos.length]);

  if (isMobile) {
    return (
      <div className="space-y-4 px-2 relative min-h-screen">
        {/* Floating FAB for actions */}
        {!isUserView && isAdmin && !selectedAlbum && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button size="icon" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center" onClick={() => setFabOpen(v => !v)} aria-label="Open actions menu">
              <Upload className="w-8 h-8" />
            </Button>
            {fabOpen && (
              <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 animate-fade-in">
                <Button variant={selectMode ? "secondary" : "outline"} onClick={() => { setSelectMode(v => !v); setSelectedAlbums([]); }} className="gap-2">
                  {selectMode ? "Cancel Selection" : "Select Multiple"}
                </Button>
                <Button onClick={() => setShowCreateAlbum(true)} variant="outline" className="gap-2">
                  <Upload className="w-5 h-5" /> Create Album
                </Button>
                <Select value={sortedYears[0] || ''} onValueChange={() => {}}>
                  <SelectTrigger className="w-48 bg-white border border-blue-200 shadow rounded-lg">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {sortedYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        {/* Create Album Dialog (mobile) */}
        <Dialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Album Name</Label>
                <Input value={albumForm.name} onChange={e => setAlbumForm(f => ({ ...f, name: e.target.value }))} placeholder="Album name" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={albumForm.description} onChange={e => setAlbumForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
              </div>
              <div>
                <Label>Cover Image/Video (optional)</Label>
                <Input type="file" accept="image/*,video/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setAlbumForm(f => ({ ...f, cover: e.target.files![0] }));
                    const url = await uploadFile(e.target.files[0], "videos");
                    setCoverUrl(url);
                  }
                }} />
              </div>
              <Button onClick={handleCreateAlbum} disabled={creatingAlbum || !albumForm.name} className="w-full">
                {creatingAlbum ? "Creating..." : "Create Album"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Album List and Dustbin remain as usual */}
        {!selectedAlbum && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {albums.map((album: any) => (
              <Card
                key={album.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer relative group overflow-hidden p-0 ${selectMode && "ring-2 ring-blue-400"}`}
                onClick={() => {
                  if (selectMode) {
                    handleSelectAlbum(album.id);
                  } else if (album.link) {
                    window.open(album.link, '_blank');
                  }
                }}
                draggable={!isUserView && isAdmin}
                onDragStart={e => {
                  if (!isUserView && isAdmin) {
                    setDraggingAlbumId(album.id);
                    e.dataTransfer.effectAllowed = "move";
                  }
                }}
                onDragEnd={() => setDraggingAlbumId(null)}
              >
                {/* Select tick for multi-select mode */}
                {selectMode && (
                  <button
                    className={`absolute top-2 right-2 z-20 bg-white rounded-full p-1 border-2 ${selectedAlbums.includes(album.id) ? "border-blue-600" : "border-gray-300"}`}
                    onClick={e => { e.stopPropagation(); handleSelectAlbum(album.id); }}
                    aria-label={selectedAlbums.includes(album.id) ? "Deselect Album" : "Select Album"}
                  >
                    {selectedAlbums.includes(album.id) ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </button>
                )}
                {/* Three-dot menu for admin (hide in select mode) */}
                {!selectMode && !isUserView && isAdmin && (
                  <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreVertical className="w-5 h-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingAlbum(album);
                          setEditAlbumForm({ name: album.name, description: album.description, cover: null, link: album.link || "" });
                          setEditCoverUrl(album.cover_url || "");
                          setShowEditAlbum(true);
                        }}>
                          Edit Album
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={e => {
                          e.stopPropagation();
                          setEditingAlbum(album);
                          setShowDeleteConfirm(true);
                        }}>
                          Delete Album
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                {/* Album preview fills card */}
                <div className="relative w-full h-40 md:h-48 lg:h-56 overflow-hidden">
                  {album.cover_url ? (
                    album.cover_url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={album.cover_url} className="w-full h-full object-cover transition duration-300 group-hover:blur-sm" />
                    ) : (
                      <img src={album.cover_url} alt="cover" className="w-full h-full object-cover transition duration-300 group-hover:blur-sm" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <Video className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                    <div className="text-lg font-bold text-white mb-1 truncate w-full">{album.name}</div>
                    <div className="text-sm text-gray-200 line-clamp-2 w-full">{album.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {/* Edit Album Dialog */}
        {!isUserView && (
          <Dialog open={showEditAlbum} onOpenChange={setShowEditAlbum}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Album</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Album Name</Label>
                  <Input value={editAlbumForm.name} onChange={e => setEditAlbumForm(f => ({ ...f, name: e.target.value }))} placeholder="Album name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={editAlbumForm.description} onChange={e => setEditAlbumForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
                </div>
                <div>
                  <Label>Google Photos Link</Label>
                  <Input
                    value={editAlbumForm.link || ""}
                    onChange={e => setEditAlbumForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="Paste Google Photos link here"
                  />
                </div>
                <div>
                  <Label>Cover Image/Video (optional)</Label>
                  <Input type="file" accept="image/*,video/*" onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      setEditAlbumForm(f => ({ ...f, cover: e.target.files![0] }));
                      const url = await uploadFile(e.target.files[0], "videos");
                      setEditCoverUrl(url);
                    }
                  }} />
                  {editCoverUrl && (
                    editCoverUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={editCoverUrl} className="w-16 h-10 object-cover rounded mt-2" />
                    ) : (
                      <img src={editCoverUrl} alt="cover" className="w-16 h-10 object-cover rounded mt-2" />
                    )
                  )}
                </div>
                <Button
                  onClick={async () => {
                    if (!editingAlbum) return;
                    let cover_url = editCoverUrl;
                    if (editAlbumForm.cover) cover_url = await uploadFile(editAlbumForm.cover, "videos");
                    await updateAlbum(editingAlbum.id, {
                      name: editAlbumForm.name,
                      description: editAlbumForm.description,
                      cover_url,
                      link: editAlbumForm.link,
                    });
                    setShowEditAlbum(false);
                    if (typeof refetch === 'function') refetch();
                  }}
                  disabled={!editAlbumForm.name}
                  className="w-full"
                >
                  Update Album
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Delete Album Confirmation Dialog */}
        {showDeleteConfirm && editingAlbum && (
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Album</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete the album <span className="font-semibold">{editingAlbum.name}</span>? This will remove all its media as well.</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deletingAlbum}>Cancel</Button>
                  <Button variant="destructive" onClick={async () => {
                    setDeletingAlbum(true);
                    await deleteAlbum(editingAlbum.id);
                    setShowDeleteConfirm(false);
                    setEditingAlbum(null);
                    setDeletingAlbum(false);
                  }} disabled={deletingAlbum}>
                    {deletingAlbum ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Album Detail View */}
        {selectedAlbum && currentAlbum && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <Button variant="outline" onClick={closeAlbum}>← Back to Albums</Button>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {currentAlbum.cover_url ? (
                  currentAlbum.cover_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={currentAlbum.cover_url} className="w-10 h-7 object-cover rounded" />
                  ) : (
                    <img src={currentAlbum.cover_url} alt="cover" className="w-10 h-7 object-cover rounded" />
                  )
                ) : (
                  <Video className="w-6 h-6 text-blue-400" />
                )}
                {currentAlbum.name}
              </h3>
              {!isUserView && isAdmin && (
                <Button onClick={() => setShowAddMedia(true)} variant="outline" className="ml-4">Add Image / Video</Button>
              )}
            </div>
            {/* Masonry layout for album media */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {currentMedia.map((media: any) => (
                <div
                  key={media.id}
                  className="break-inside-avoid mb-4 relative group rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-white"
                  style={media.type === 'video' ? { aspectRatio: '9/16', maxWidth: 360, margin: '0 auto' } : {}}
                  onDoubleClick={() => {
                    if (media.type === 'video') {
                      handleLike(media.id);
                      setHeartAnims((prev) => ({ ...prev, [media.id]: true }));
                      setTimeout(() => setHeartAnims((prev) => ({ ...prev, [media.id]: false })), 900);
                    }
                  }}
                >
                  {media.type === 'image' ? (
                    <img src={media.url} alt={media.title || ''} className="w-full h-auto object-cover rounded-t" />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <video src={media.url} controls className="w-full h-full object-contain" preload="metadata" style={{ aspectRatio: '9/16', maxHeight: 480 }} />
                      {/* Heart animation overlay */}
                      <span
                        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-0 transition-all duration-300 ${heartAnims[media.id] ? 'opacity-100 scale-150' : 'scale-75'}`}
                        style={{ fontSize: 96, zIndex: 10 }}
                      >
                        ❤️
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    {!isUserView && isAdmin && (
                      <Button size="icon" variant="destructive" onClick={() => deleteAlbumMedia(media.id)}>
                        ×
                      </Button>
                    )}
                  </div>
                  {media.title && (
                    <div className="text-xs text-gray-700 mt-1 px-2 truncate pb-2 pt-1 bg-white/80 backdrop-blur-sm">{media.title}</div>
                  )}
                </div>
              ))}
            </div>
            {/* Add Media to Album (admin only, floating panel) */}
            {!isUserView && (
              <Dialog open={showAddMedia} onOpenChange={setShowAddMedia}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add Media to Album</DialogTitle>
                  </DialogHeader>
                  <CardContent className="space-y-4">
                    <AddMediaToAlbum albumId={selectedAlbum} addAlbumMedia={addAlbumMedia} />
                  </CardContent>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
        {/* Bulk Delete Albums Confirmation Dialog */}
        {showBulkDeleteConfirm && selectedAlbums.length > 0 && (
          <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Albums</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete <span className="font-semibold">{selectedAlbums.length}</span> selected album(s)? This will remove all their media as well.</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting}>Cancel</Button>
                  <Button variant="destructive" onClick={async () => {
                    setBulkDeleting(true);
                    for (const id of selectedAlbums) {
                      await deleteAlbum(id);
                    }
                    setBulkDeleting(false);
                    setShowBulkDeleteConfirm(false);
                    setSelectMode(false);
                    setSelectedAlbums([]);
                  }} disabled={bulkDeleting}>
                    {bulkDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Dustbin for drag-to-delete */}
        {!isUserView && isAdmin && draggingAlbumId && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
            onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
            onDragLeave={() => setDragOverDustbin(false)}
            onDrop={e => {
              setDragOverDustbin(false);
              setDraggingAlbumId(null);
              // If in select mode and album is selected, delete all selected, else just the dragged one
              if (selectMode && selectedAlbums.length > 0 && selectedAlbums.includes(draggingAlbumId)) {
                setShowBulkDeleteConfirm(true);
              } else {
                setEditingAlbum(albums.find(a => a.id === draggingAlbumId));
                setShowDeleteConfirm(true);
              }
            }}
            style={{ pointerEvents: "all" }}
          >
            <div className={`bg-white shadow-lg rounded-full p-4 border-2 ${dragOverDustbin ? "border-red-600" : "border-gray-300"}`}>
              <Trash2 className={`w-10 h-10 ${dragOverDustbin ? "text-red-600" : "text-gray-500"}`} />
            </div>
            <span className="mt-2 text-sm font-semibold text-gray-700">Drop here to delete</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-6">
      {/* Enhanced Section Header */}
      <section className="bg-blue-50 rounded-xl px-6 py-4 mb-6 shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span role="img" aria-label="memories">🎞️</span>
            Memories
          </h2>
        </div>
        {/* Only show controls when no album is open */}
        {!selectedAlbum && (
          <div className="flex gap-2 items-center">
            {!isUserView && isAdmin && selectMode && selectedAlbums.length > 0 && (
              <Button variant="destructive" size="icon" onClick={() => setShowBulkDeleteConfirm(true)} title="Delete Selected Albums">
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            {!isUserView && isAdmin && (
              <Button variant={selectMode ? "secondary" : "outline"} onClick={() => {
                setSelectMode(v => !v);
                setSelectedAlbums([]);
              }} className="gap-2">
                {selectMode ? "Cancel Selection" : "Select Multiple"}
              </Button>
            )}
            {!isUserView && isAdmin && (
              <Button onClick={() => setShowCreateAlbum(true)} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Create Album
              </Button>
            )}
          </div>
        )}
      </section>
      {showUpload && isAdmin && !isUserView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle>Upload Memory Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Year" type="number" min="2000" max={new Date().getFullYear()} />
              </div>
              <div>
                <Label>Video File</Label>
                <Input type="file" accept="video/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setForm(f => ({ ...f, video: e.target.files![0] }));
                  }
                }} />
              </div>
              <div>
                <Label>Thumbnail (optional)</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setForm(f => ({ ...f, thumbnail: e.target.files![0] }));
                  }
                }} />
              </div>
              <Button onClick={handleUpload} disabled={uploading || !form.title || !form.year || !form.video} className="w-full">
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowUpload(false)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Create Album Dialog */}
      <Dialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Album Name</Label>
              <Input value={albumForm.name} onChange={e => setAlbumForm(f => ({ ...f, name: e.target.value }))} placeholder="Album name" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={albumForm.description} onChange={e => setAlbumForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
            </div>
            <div>
              <Label>Cover Image/Video (optional)</Label>
              <Input type="file" accept="image/*,video/*" onChange={async e => {
                if (e.target.files && e.target.files[0]) {
                  setAlbumForm(f => ({ ...f, cover: e.target.files![0] }));
                  const url = await uploadFile(e.target.files[0], "videos");
                  setCoverUrl(url);
                }
              }} />
            </div>
            <Button onClick={handleCreateAlbum} disabled={creatingAlbum || !albumForm.name} className="w-full">
              {creatingAlbum ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Filter Bar (Year) */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white/80 rounded-2xl shadow p-4 border border-blue-100">
        {/* Example: Year filter, can be extended for albums */}
        <Select value={sortedYears[0] || ''} onValueChange={() => {}}>
          <SelectTrigger className="w-48 rounded-xl border-blue-200 bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm text-blue-900 font-semibold">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {sortedYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Album List */}
      {!selectedAlbum && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {albums.map((album: any) => (
            <Card
              key={album.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer relative group overflow-hidden p-0 ${selectMode && "ring-2 ring-blue-400"}`}
              onClick={() => {
                if (selectMode) {
                  handleSelectAlbum(album.id);
                } else if (album.link) {
                  window.open(album.link, '_blank');
                }
              }}
              draggable={!isUserView && isAdmin}
              onDragStart={e => {
                if (!isUserView && isAdmin) {
                  setDraggingAlbumId(album.id);
                  e.dataTransfer.effectAllowed = "move";
                }
              }}
              onDragEnd={() => setDraggingAlbumId(null)}
            >
              {/* Select tick for multi-select mode */}
              {selectMode && (
                <button
                  className={`absolute top-2 right-2 z-20 bg-white rounded-full p-1 border-2 ${selectedAlbums.includes(album.id) ? "border-blue-600" : "border-gray-300"}`}
                  onClick={e => { e.stopPropagation(); handleSelectAlbum(album.id); }}
                  aria-label={selectedAlbums.includes(album.id) ? "Deselect Album" : "Select Album"}
                >
                  {selectedAlbums.includes(album.id) ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </button>
              )}
              {/* Three-dot menu for admin (hide in select mode) */}
              {!selectMode && !isUserView && isAdmin && (
                <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreVertical className="w-5 h-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingAlbum(album);
                        setEditAlbumForm({ name: album.name, description: album.description, cover: null, link: album.link || "" });
                        setEditCoverUrl(album.cover_url || "");
                        setShowEditAlbum(true);
                      }}>
                        Edit Album
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={e => {
                        e.stopPropagation();
                        setEditingAlbum(album);
                        setShowDeleteConfirm(true);
                      }}>
                        Delete Album
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {/* Album preview fills card */}
              <div className="relative w-full h-40 md:h-48 lg:h-56 overflow-hidden">
                {album.cover_url ? (
                  album.cover_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={album.cover_url} className="w-full h-full object-cover transition duration-300 group-hover:blur-sm" />
                  ) : (
                    <img src={album.cover_url} alt="cover" className="w-full h-full object-cover transition duration-300 group-hover:blur-sm" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <Video className="w-12 h-12 text-blue-400" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                  <div className="text-lg font-bold text-white mb-1 truncate w-full">{album.name}</div>
                  <div className="text-sm text-gray-200 line-clamp-2 w-full">{album.description}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Edit Album Dialog */}
      {!isUserView && (
        <Dialog open={showEditAlbum} onOpenChange={setShowEditAlbum}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Album Name</Label>
                <Input value={editAlbumForm.name} onChange={e => setEditAlbumForm(f => ({ ...f, name: e.target.value }))} placeholder="Album name" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editAlbumForm.description} onChange={e => setEditAlbumForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
              </div>
              <div>
                <Label>Google Photos Link</Label>
                <Input
                  value={editAlbumForm.link || ""}
                  onChange={e => setEditAlbumForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="Paste Google Photos link here"
                />
              </div>
              <div>
                <Label>Cover Image/Video (optional)</Label>
                <Input type="file" accept="image/*,video/*" onChange={async e => {
                  if (e.target.files && e.target.files[0]) {
                    setEditAlbumForm(f => ({ ...f, cover: e.target.files![0] }));
                    const url = await uploadFile(e.target.files[0], "videos");
                    setEditCoverUrl(url);
                  }
                }} />
                {editCoverUrl && (
                  editCoverUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={editCoverUrl} className="w-16 h-10 object-cover rounded mt-2" />
                  ) : (
                    <img src={editCoverUrl} alt="cover" className="w-16 h-10 object-cover rounded mt-2" />
                  )
                )}
              </div>
              <Button
                onClick={async () => {
                  if (!editingAlbum) return;
                  let cover_url = editCoverUrl;
                  if (editAlbumForm.cover) cover_url = await uploadFile(editAlbumForm.cover, "videos");
                  await updateAlbum(editingAlbum.id, {
                    name: editAlbumForm.name,
                    description: editAlbumForm.description,
                    cover_url,
                    link: editAlbumForm.link,
                  });
                  setShowEditAlbum(false);
                  if (typeof refetch === 'function') refetch();
                }}
                disabled={!editAlbumForm.name}
                className="w-full"
              >
                Update Album
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Delete Album Confirmation Dialog */}
      {showDeleteConfirm && editingAlbum && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete the album <span className="font-semibold">{editingAlbum.name}</span>? This will remove all its media as well.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deletingAlbum}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  setDeletingAlbum(true);
                  await deleteAlbum(editingAlbum.id);
                  setShowDeleteConfirm(false);
                  setEditingAlbum(null);
                  setDeletingAlbum(false);
                }} disabled={deletingAlbum}>
                  {deletingAlbum ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Album Detail View */}
      {selectedAlbum && currentAlbum && (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Button variant="outline" onClick={closeAlbum}>← Back to Albums</Button>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {currentAlbum.cover_url ? (
                currentAlbum.cover_url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={currentAlbum.cover_url} className="w-10 h-7 object-cover rounded" />
                ) : (
                  <img src={currentAlbum.cover_url} alt="cover" className="w-10 h-7 object-cover rounded" />
                )
              ) : (
                <Video className="w-6 h-6 text-blue-400" />
              )}
              {currentAlbum.name}
            </h3>
            {!isUserView && isAdmin && (
              <Button onClick={() => setShowAddMedia(true)} variant="outline" className="ml-4">Add Image / Video</Button>
            )}
          </div>
          {/* Masonry layout for album media */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {currentMedia.map((media: any) => (
              <div
                key={media.id}
                className="break-inside-avoid mb-4 relative group rounded-lg overflow-hidden shadow hover:shadow-lg transition-all bg-white"
                style={media.type === 'video' ? { aspectRatio: '9/16', maxWidth: 360, margin: '0 auto' } : {}}
                onDoubleClick={() => {
                  if (media.type === 'video') {
                    handleLike(media.id);
                    setHeartAnims((prev) => ({ ...prev, [media.id]: true }));
                    setTimeout(() => setHeartAnims((prev) => ({ ...prev, [media.id]: false })), 900);
                  }
                }}
              >
                {media.type === 'image' ? (
                  <img src={media.url} alt={media.title || ''} className="w-full h-auto object-cover rounded-t" />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video src={media.url} controls className="w-full h-full object-contain" preload="metadata" style={{ aspectRatio: '9/16', maxHeight: 480 }} />
                    {/* Heart animation overlay */}
                    <span
                      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-0 transition-all duration-300 ${heartAnims[media.id] ? 'opacity-100 scale-150' : 'scale-75'}`}
                      style={{ fontSize: 96, zIndex: 10 }}
                    >
                      ❤️
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  {!isUserView && isAdmin && (
                    <Button size="icon" variant="destructive" onClick={() => deleteAlbumMedia(media.id)}>
                      ×
                    </Button>
                  )}
                </div>
                {media.title && (
                  <div className="text-xs text-gray-700 mt-1 px-2 truncate pb-2 pt-1 bg-white/80 backdrop-blur-sm">{media.title}</div>
                )}
              </div>
            ))}
          </div>
          {/* Add Media to Album (admin only, floating panel) */}
          {!isUserView && (
            <Dialog open={showAddMedia} onOpenChange={setShowAddMedia}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add Media to Album</DialogTitle>
                </DialogHeader>
                <CardContent className="space-y-4">
                  <AddMediaToAlbum albumId={selectedAlbum} addAlbumMedia={addAlbumMedia} />
                </CardContent>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
      {/* Bulk Delete Albums Confirmation Dialog */}
      {showBulkDeleteConfirm && selectedAlbums.length > 0 && (
        <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Albums</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete <span className="font-semibold">{selectedAlbums.length}</span> selected album(s)? This will remove all their media as well.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  setBulkDeleting(true);
                  for (const id of selectedAlbums) {
                    await deleteAlbum(id);
                  }
                  setBulkDeleting(false);
                  setShowBulkDeleteConfirm(false);
                  setSelectMode(false);
                  setSelectedAlbums([]);
                }} disabled={bulkDeleting}>
                  {bulkDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Dustbin for drag-to-delete */}
      {!isUserView && isAdmin && draggingAlbumId && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all ${dragOverDustbin ? "scale-110" : "scale-100"}`}
          onDragOver={e => { e.preventDefault(); setDragOverDustbin(true); }}
          onDragLeave={() => setDragOverDustbin(false)}
          onDrop={e => {
            setDragOverDustbin(false);
            setDraggingAlbumId(null);
            // If in select mode and album is selected, delete all selected, else just the dragged one
            if (selectMode && selectedAlbums.length > 0 && selectedAlbums.includes(draggingAlbumId)) {
              setShowBulkDeleteConfirm(true);
            } else {
              setEditingAlbum(albums.find(a => a.id === draggingAlbumId));
              setShowDeleteConfirm(true);
            }
          }}
          style={{ pointerEvents: "all" }}
        >
          <div className={`bg-white shadow-lg rounded-full p-4 border-2 ${dragOverDustbin ? "border-red-600" : "border-gray-300"}`}>
            <Trash2 className={`w-10 h-10 ${dragOverDustbin ? "text-red-600" : "text-gray-500"}`} />
          </div>
          <span className="mt-2 text-sm font-semibold text-gray-700">Drop here to delete</span>
        </div>
      )}
    </div>
  );
}

// AddMediaToAlbum component for uploading images/videos to an album
function AddMediaToAlbum({ albumId, addAlbumMedia }: { albumId: string, addAlbumMedia: any }) {
  const [type, setType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string) => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: false });
    setUploading(false);
    if (error) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data?.publicUrl || "";
  };

  const handleAdd = async () => {
    if (!file) return;
    const url = await uploadFile(file, "videos");
    await addAlbumMedia({
      album_id: albumId,
      type,
      url,
      title,
      description,
    });
    setFile(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Type</Label>
        <select value={type} onChange={e => setType(e.target.value as 'image' | 'video')} className="w-full border rounded p-2">
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      <div>
        <Label>File</Label>
        <Input type="file" accept={type === 'image' ? 'image/*' : 'video/*'} onChange={e => {
          if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
        }} />
      </div>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Media title (optional)" />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
      </div>
      <Button onClick={handleAdd} disabled={uploading || !file} className="w-full">
        {uploading ? "Uploading..." : "Add to Album"}
      </Button>
    </div>
  );
} 