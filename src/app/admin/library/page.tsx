'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { LibraryAsset } from '@/lib/types';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, File as FileIcon, Video, Image as ImageIcon, Download, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';

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

    if (isEditing) {
      if (!currentAsset.id || !currentAsset.title) {
        toast({ variant: 'destructive', title: 'Title is required for editing.' });
        setIsUploading(false);
        return;
      }
      // For videos, ensure there is a fileUrl
      if (currentAsset.type === 'video' && !currentAsset.fileUrl) {
          toast({ variant: 'destructive', title: 'Video URL is required.' });
          setIsUploading(false);
          return;
      }
      
      const { id, ...updateData } = currentAsset;
      const assetDocRef = doc(firestore, 'libraryAssets', id);
      try {
        await updateDoc(assetDocRef, updateData);
        toast({ title: 'Asset Updated!' });
        closeDialog();
      } catch (error) {
        console.error("Error updating asset: ", error);
        toast({ variant: 'destructive', title: 'Update failed', description: 'Could not update the asset in the database.'});
      }
      setIsUploading(false);
      return;
    }
  
    // Logic for adding a new video by URL
    if (currentAsset.type === 'video') {
        if (!currentAsset.fileUrl || !currentAsset.title) {
            toast({ variant: 'destructive', title: 'Title and Video URL are required.' });
            setIsUploading(false);
            return;
        }
        try {
            const newAssetData: LibraryAsset = {
                id: nanoid(),
                title: currentAsset.title,
                description: currentAsset.description || '',
                type: 'video',
                fileUrl: currentAsset.fileUrl,
                createdAt: new Date().toISOString(),
            };
            await addDoc(collection(firestore, 'libraryAssets'), newAssetData);
            toast({ title: 'Video Asset Added!' });
            closeDialog();
        } catch (error) {
            console.error('Error adding video asset by URL:', error);
            toast({ variant: 'destructive', title: 'Failed to add video asset.' });
        }
        setIsUploading(false);
        return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files selected',
        description: 'Please select one or more files to upload for this asset type.',
      });
      setIsUploading(false);
      return;
    }
  
    toast({
      title: 'Upload Started',
      description: `Uploading ${selectedFiles.length} file(s)...`,
    });
  
    let successCount = 0;
    let errorCount = 0;
    const assetsCollectionRef = collection(firestore, 'libraryAssets');
  
    for (const file of Array.from(selectedFiles)) {
      try {
        const assetId = nanoid();
        const storageRef = ref(storage, `library-assets/${user.uid}/${assetId}-${file.name}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        let type: LibraryAsset['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';

        const newAssetData: LibraryAsset = {
          id: assetId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: currentAsset.description || '',
          type,
          fileUrl: downloadURL,
          createdAt: new Date().toISOString(),
        };
        
        await addDoc(assetsCollectionRef, newAssetData);
        successCount++;
      } catch (fileError) {
        errorCount++;
        console.error(`Failed to upload file: ${file.name}`, fileError);
      }
    }
  
    setIsUploading(false);
    if (successCount > 0) {
      toast({
        title: 'Upload Complete!',
        description: `${successCount} of ${selectedFiles.length} asset(s) were successfully added.`,
      });
    }
    if (errorCount > 0) {
       toast({
          variant: 'destructive',
          title: 'Some Uploads Failed',
          description: `${errorCount} file(s) could not be uploaded. Check the console for details.`,
        });
    }
  
    closeDialog();
  };

  const handleDelete = async (asset: LibraryAsset) => {
    if (!firestore || !storage || !asset.id) return;

    // Only try to delete from storage if it's not an external video link
    if (asset.fileUrl && !asset.fileUrl.startsWith('http')) {
        try {
            const fileRef = ref(storage, asset.fileUrl);
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting file from Storage: ", error);
                toast({
                variant: "destructive",
                title: "Storage Deletion Failed",
                description: "Could not delete the file from storage. The library entry will still be removed."
                });
            }
        }
    }
    
    try {
        await deleteDoc(doc(firestore, 'libraryAssets', asset.id));
        toast({ title: 'Asset Deleted' });
    } catch(error) {
        console.error("Error deleting firestore doc: ", error);
         toast({
          variant: "destructive",
          title: "Firestore Deletion Failed",
          description: "Could not delete the asset from the library."
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
    setCurrentAsset(defaultAsset);
    setIsEditing(false);
    setSelectedFiles(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
  }

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
          <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Asset
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Asset' : 'Add New Asset(s)'}</DialogTitle>
                     <DialogDescription>
                        {isEditing 
                            ? "Edit the details for the asset."
                            : "Upload files or add a video URL."
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
                  
                  <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={currentAsset.title || ''} onChange={e => setCurrentAsset(p => ({...p, title: e.target.value}))} placeholder={isVideoMode && !isEditing ? "Video Title" : "Asset Title"}/>
                  </div>

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
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
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
                <CardContent className="flex-grow">
                   {asset.type === 'image' && asset.fileUrl && (
                     <Dialog>
                        <DialogTrigger asChild>
                           <img src={asset.fileUrl} alt={asset.title} className="rounded-md max-h-48 object-contain mx-auto cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col items-center justify-center">
                            <DialogTitle className="sr-only">{asset.title}</DialogTitle>
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
                      <video controls src={asset.fileUrl} className="rounded-md w-full" >
                          Your browser does not support the video tag.
                      </video>
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
                           <DialogTitle className="sr-only">{asset.title}</DialogTitle>
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
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(asset)}><Trash2 className="h-4 w-4" /></Button>
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
