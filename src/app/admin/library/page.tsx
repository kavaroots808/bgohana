
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, writeBatch } from 'firebase/firestore';
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

const defaultAsset: Omit<LibraryAsset, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  type: 'document',
  fileUrl: ''
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

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !firestore || !storage || !user) {
      return;
    }

    setIsUploading(true);
    toast({
      title: 'Batch Upload Started',
      description: `Uploading ${files.length} file(s)... This may take a moment.`,
    });
    
    const assetsCollectionRef = collection(firestore, 'libraryAssets');
    let uploadPromises = [];

    for (const file of Array.from(files)) {
      const assetId = nanoid();
      const storageRef = ref(storage, `library-assets/${user.uid}/${assetId}-${file.name}`);
      
      const uploadPromise = uploadBytes(storageRef, file).then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        let type: LibraryAsset['type'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';

        const newAsset: Omit<LibraryAsset, 'id'> = {
          title: file.name.replace(/\.[^/.]+$/, ""), // Use filename as title
          description: '',
          type,
          fileUrl: downloadURL,
          createdAt: new Date().toISOString(),
        };

        const newDocRef = doc(assetsCollectionRef); // Let firestore generate ID
        await setDoc(newDocRef, newAsset);
      });
      uploadPromises.push(uploadPromise);
    }
    
    try {
        await Promise.all(uploadPromises); // Wait for all uploads to finish
        toast({
            title: 'Batch Upload Successful!',
            description: `${files.length} new asset(s) have been added to the library.`,
        });
    } catch (error) {
        console.error('Batch upload failed:', error);
        toast({
            variant: 'destructive',
            title: 'Batch Upload Failed',
            description: 'Could not add the new assets. Please try again.',
        });
    } finally {
        setIsUploading(false);
        // Reset file input
        if (e.target) {
            e.target.value = '';
        }
        closeDialog();
    }
  };


  const handleSave = () => {
    if (!firestore || !currentAsset.title) {
        toast({ variant: 'destructive', title: 'Title is required.' });
        return;
    }
    
    if (isEditing && currentAsset.id) {
        const { id, ...updateData } = currentAsset;
        updateDocumentNonBlocking(doc(firestore, 'libraryAssets', id), updateData);
        toast({ title: 'Asset Updated!' });
    } else {
        // This path is for single asset creation via URL paste, not file upload.
         if (!currentAsset.fileUrl) {
            toast({ variant: 'destructive', title: 'File URL is required.' });
            return;
        }
        const newAsset: Omit<LibraryAsset, 'id'> = {
            title: currentAsset.title,
            description: currentAsset.description || '',
            type: currentAsset.type || 'document',
            fileUrl: currentAsset.fileUrl,
            createdAt: new Date().toISOString(),
        };
        addDocumentNonBlocking(collection(firestore, 'libraryAssets'), newAsset);
        toast({ title: 'Asset Added!' });
    }
    closeDialog();
  }

  const handleDelete = async (asset: LibraryAsset) => {
    if (!firestore || !storage) return;

    // Create a reference to the file to delete
    try {
      const fileRef = ref(storage, asset.fileUrl);
      await deleteObject(fileRef);
    } catch (error: any) {
       // If the file doesn't exist in storage (e.g. from a pasted URL), it might throw an error.
       // We can choose to ignore this error if we know some assets might not have stored files.
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting file from Storage: ", error);
        toast({
          variant: 'destructive',
          title: "Storage Deletion Failed",
          description: "Could not delete the file from storage, but the library entry will be removed."
        });
      }
    }
    
    // Proceed to delete the Firestore document
    deleteDocumentNonBlocking(doc(firestore, 'libraryAssets', asset.id));
    toast({ title: 'Asset Deleted' });
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
  }

  if (!isAdmin) {
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manage Asset Library</h1>
            <p className="text-muted-foreground">Add, edit, or delete shared assets.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            : "Upload multiple files at once, or paste a URL for a single asset."
                        }
                    </DialogDescription>
                </DialogHeader>
                
                {!isEditing && (
                    <>
                    <Button variant="outline" className="w-full h-24 border-dashed" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : <><Upload className="mr-2 h-6 w-6" /> Batch Upload Files</>}
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleBatchUpload}
                        multiple
                        disabled={isUploading}
                    />
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or add a single asset by URL</span>
                        </div>
                    </div>
                    </>
                )}

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={currentAsset.title || ''} onChange={e => setCurrentAsset(p => ({...p, title: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={currentAsset.description || ''} onChange={e => setCurrentAsset(p => ({...p, description: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="type">Asset Type</Label>
                         <Select value={currentAsset.type} onValueChange={(value: LibraryAsset['type']) => setCurrentAsset(p => ({...p, type: value}))}>
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
                        <Label>File URL</Label>
                        <div className="flex items-center gap-2">
                           <Input id="fileUrl" value={currentAsset.fileUrl || ''} onChange={e => setCurrentAsset(p => ({...p, fileUrl: e.target.value}))} placeholder="Paste a URL for a single asset" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleSave}>{isEditing ? 'Save Changes' : 'Save URL Asset'}</Button>
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
                           <iframe src={asset.fileUrl} className="w-full flex-1 rounded-md" title={asset.title}></iframe>
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
