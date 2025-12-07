'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { LibraryAsset } from '@/lib/types';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, File as FileIcon, Video, Image as ImageIcon, Download, Upload, ExternalLink } from 'lucide-react';
import { nanoid } from 'nanoid';

const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    let videoId = null;
    let platform = null;

    // Comprehensive regex for YouTube, now including /live/
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        videoId = youtubeMatch[1];
        platform = 'youtube';
    } else {
        // Comprehensive regex for Vimeo
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            videoId = vimeoMatch[1];
            platform = 'vimeo';
        }
    }

    if (platform === 'youtube' && videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    if (platform === 'vimeo' && videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return null;
};


const AssetIcon = ({ type }: { type: LibraryAsset['type'] }) => {
  switch (type) {
    case 'video':
      return <Video className="h-8 w-8 text-red-500" />;
    case 'image':
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    case 'document':
      return <FileIcon className="h-8 w-8 text-gray-500" />;
    default:
      return <FileIcon className="h-8 w-8 text-gray-500" />;
  }
};

const defaultAsset: Partial<LibraryAsset> = {
  title: '',
  description: '',
  type: 'document',
  fileUrl: '',
};

function ManageLibraryContent() {
  const { firestore, storage } = useFirebase();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Partial<LibraryAsset>>(defaultAsset);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/library');
    }
  }, [isAdmin, router]);

  const assetsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'libraryAssets'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );
  
  const { data: assets, isLoading } = useCollection<LibraryAsset>(assetsQuery);

  const handleSave = async () => {
    if (!firestore || !storage || !user) {
        toast({ variant: 'destructive', title: 'You must be logged in as an admin.'});
        return;
    }
  
    setIsUploading(true);
  
    try {
      // Logic for editing an existing asset
      if (isEditing) {
        if (!currentAsset.id || !currentAsset.title) {
          throw new Error('Title is required for editing.');
        }
        if (currentAsset.type === 'video' && !currentAsset.fileUrl) {
            throw new Error('Video URL is required.');
        }
        
        const { id, ...updateData } = currentAsset;
        const assetDocRef = doc(firestore, 'libraryAssets', id);
        await updateDoc(assetDocRef, updateData);
        toast({ title: 'Asset Updated!' });
      } else {
        // Logic for adding a new asset (files or video URL)
        if (currentAsset.type === 'video') {
          if (!currentAsset.fileUrl || !currentAsset.title) {
            throw new Error('Title and Video URL are required.');
          }
          const assetId = nanoid();
          const newAssetData: LibraryAsset = {
            id: assetId,
            title: currentAsset.title,
            description: currentAsset.description || '',
            type: 'video',
            fileUrl: currentAsset.fileUrl,
            createdAt: new Date().toISOString(),
          };
          const newDocRef = doc(firestore, 'libraryAssets', assetId);
          await setDoc(newDocRef, newAssetData);
          toast({ title: 'Video Asset Added!' });
        } else {
          // Logic for uploading files
          if (!selectedFiles || selectedFiles.length === 0) {
            throw new Error('Please select one or more files to upload.');
          }
    
          toast({
            title: 'Upload Started',
            description: `Uploading ${selectedFiles.length} file(s)...`,
          });
    
          let successCount = 0;
          for (const file of Array.from(selectedFiles)) {
            const assetId = nanoid();
            const storageRef = ref(storage, `library-assets/${user.uid}/${assetId}-${file.name}`);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            let type: LibraryAsset['type'] = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            // Note: Uploading videos directly is disabled in this flow to favor URL embedding.
            // If you want to enable it, you'll need a different check here.
            
            const newAssetData: LibraryAsset = {
              id: assetId,
              title: file.name.replace(/\.[^/.]+$/, ""),
              description: currentAsset.description || '',
              type,
              fileUrl: downloadURL,
              createdAt: new Date().toISOString(),
            };
            
            const newDocRef = doc(firestore, 'libraryAssets', assetId);
            await setDoc(newDocRef, newAssetData);
            successCount++;
          }
    
          if (successCount > 0) {
            toast({
              title: 'Upload Complete!',
              description: `${successCount} asset(s) were successfully added.`,
            });
          }
        }
      }
      closeDialog();
    } catch (error: any) {
        console.error("Save operation failed: ", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: error.message || 'Could not save the asset(s).',
        });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDelete = async (asset: LibraryAsset) => {
    if (!firestore || !storage || !asset.id) return;

    // First delete the Firestore document
    try {
        await deleteDoc(doc(firestore, 'libraryAssets', asset.id));
        toast({ title: 'Asset Deleted' });

        // If Firestore deletion is successful, then delete the file from Storage
        // This prevents orphaned files if the DB delete fails
        const isFirebaseStorageUrl = asset.fileUrl.includes('firebasestorage.googleapis.com');
        if (isFirebaseStorageUrl) {
            const fileRef = ref(storage, asset.fileUrl);
            await deleteObject(fileRef);
        }
    } catch (error: any) {
        console.error("Error during asset deletion: ", error);
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: error.message || "Could not delete the asset. Check console for details."
        });
    }
  }

  const openEditDialog = (asset: LibraryAsset) => {
    setCurrentAsset(asset);
    setIsEditing(true);
    setIsDialogOpen(true);
  }

  const openNewDialog = () => {
    setCurrentAsset(defaultAsset);
    setIsEditing(false);
    setIsDialogOpen(true);
  }

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
        setCurrentAsset(defaultAsset);
        setIsEditing(false);
        setSelectedFiles(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploading(false);
    }, 300);
  };

  if (!isAdmin) {
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
  }
  
  const isVideoMode = currentAsset.type === 'video';

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manage Asset Library</h1>
            <p className="text-muted-foreground">Add, edit, or delete shared assets.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
                closeDialog();
            } else {
                setIsDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Asset
                </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={(e) => {
              if (isUploading || (e.target as HTMLElement).closest('[data-radix-toast-provider]')) {
                e.preventDefault();
              }
            }}>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Asset' : 'Add New Asset(s)'}</DialogTitle>
                     <DialogDescription>
                        {isEditing 
                            ? "Edit the details for the asset."
                            : "Upload files for images/documents or add a video URL."
                        }
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                      <Label htmlFor="type">Asset Type</Label>
                       <Select value={currentAsset.type} onValueChange={(value: LibraryAsset['type']) => setCurrentAsset(p => ({...p, type: value}))} disabled={isEditing}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  
                  {(isEditing || isVideoMode) && (
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={currentAsset.title || ''} onChange={e => setCurrentAsset(p => ({...p, title: e.target.value}))} placeholder={isVideoMode ? "Video Title" : "Asset Title"}/>
                    </div>
                  )}

                  {isVideoMode ? (
                      <div>
                          <Label htmlFor="fileUrl">Video URL</Label>
                          <Input id="fileUrl" value={currentAsset.fileUrl || ''} onChange={e => setCurrentAsset(p => ({...p, fileUrl: e.target.value}))} placeholder="e.g., https://www.youtube.com/watch?v=..."/>
                      </div>
                  ) : (
                    !isEditing && (
                        <div>
                          <Label htmlFor="file-upload">Files</Label>
                          <div className='flex items-center gap-2 mt-2'>
                            <Button variant="outline" className='w-full' onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                               <Upload className="mr-2 h-4 w-4" /> Select Files
                            </Button>
                            <input 
                                type="file" 
                                id="file-upload"
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                multiple
                                disabled={isUploading}
                            />
                          </div>
                          {selectedFiles && selectedFiles.length > 0 && (
                            <p className='text-sm text-muted-foreground mt-2'>{selectedFiles.length} file(s) selected.</p>
                          )}
                        </div>
                    )
                  )}

                  <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder={isEditing ? "Asset description..." : "Optional: Add a description..."} value={currentAsset.description || ''} onChange={e => setCurrentAsset(p => ({...p, description: e.target.value}))} />
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isUploading}>
                      {isUploading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save New Asset(s)')}
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p>Loading assets...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets && assets.length > 0 ? assets.map(asset => (
              <Card key={asset.id} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-4">
                  <AssetIcon type={asset.type} />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{asset.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{asset.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                   {asset.type === 'image' && asset.fileUrl && (
                     <Dialog>
                        <DialogTrigger asChild>
                           <img src={asset.fileUrl} alt={asset.title} className="rounded-md max-h-48 object-contain mx-auto cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col items-center justify-center p-2 sm:p-4">
                            <DialogHeader>
                                <DialogTitle>{asset.title}</DialogTitle>
                            </DialogHeader>
                            <img src={asset.fileUrl} alt={asset.title} className="max-w-full max-h-full object-contain" />
                            <DialogFooter className="mt-4">
                               <Button asChild>
                                   <a href={asset.fileUrl} download={`${asset.title.replace(/\s+/g, '_') || 'asset'}.jpg`} target="_blank">
                                       <Download className="mr-2 h-4 w-4" /> Download
                                   </a>
                               </Button>
                           </DialogFooter>
                        </DialogContent>
                     </Dialog>
                   )}
                   {asset.type === 'video' && asset.fileUrl && (
                        (() => {
                            const embedUrl = getEmbedUrl(asset.fileUrl);
                            if (embedUrl) {
                                return (
                                    <div className="rounded-md overflow-hidden aspect-video w-full bg-black">
                                        <iframe 
                                            src={embedUrl}
                                            className="w-full h-full"
                                            title={asset.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                );
                            }
                            return (
                                <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg h-full w-full text-center opacity-50">
                                    <Video className="h-16 w-16 text-muted-foreground" />
                                    <span className="mt-2 text-sm font-medium">Video Unavailable</span>
                                </div>
                            );
                        })()
                    )}
                   {asset.type === 'document' && asset.fileUrl && (
                     <Dialog>
                        <DialogTrigger asChild>
                           <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg h-full cursor-pointer">
                                <FileIcon className="h-16 w-16 text-muted-foreground" />
                                <span className="mt-2 text-sm font-medium text-center">View Document</span>
                           </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-2 sm:p-4">
                           <DialogHeader>
                                <DialogTitle>{asset.title}</DialogTitle>
                           </DialogHeader>
                           <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(asset.fileUrl)}&embedded=true`} className="w-full flex-1 rounded-md" title={asset.title}></iframe>
                           <DialogFooter className="mt-4">
                               <Button asChild>
                                   <a href={asset.fileUrl} download={`${asset.title.replace(/\s+/g, '_') || 'document'}`} target="_blank">
                                       <Download className="mr-2 h-4 w-4" /> Download
                                   </a>
                               </Button>
                           </DialogFooter>
                        </DialogContent>
                     </Dialog>
                   )}
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(asset)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the asset "{asset.title}".
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(asset)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )) : (
              <p className="text-muted-foreground col-span-full text-center">No assets found. Add one to get started!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminLibraryPage() {
  return (
    <AuthProvider>
      <ManageLibraryContent />
    </AuthProvider>
  );
}
