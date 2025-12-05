
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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
import { PlusCircle, Edit, Trash2, File as FileIcon, Video, Image as ImageIcon } from 'lucide-react';
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
  const { firestore } = useFirebase();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Partial<LibraryAsset>>(defaultAsset);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to Firebase Storage and get a URL.
      // For this prototype, we'll simulate it with a placeholder.
      const simulatedUrl = `https://picsum.photos/seed/${nanoid()}/400/300`;
      setCurrentAsset(prev => ({...prev, fileUrl: simulatedUrl }));
       toast({
        title: 'File "Uploaded"',
        description: `Using placeholder URL: ${simulatedUrl}`,
      });
    }
  };

  const handleSave = () => {
    if (!firestore || !currentAsset.title || !currentAsset.fileUrl) {
        toast({ variant: 'destructive', title: 'Missing required fields.' });
        return;
    }
    
    if (isEditing && currentAsset.id) {
        const { id, ...updateData } = currentAsset;
        updateDocumentNonBlocking(doc(firestore, 'libraryAssets', id), updateData);
        toast({ title: 'Asset Updated!' });
    } else {
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

  const handleDelete = (assetId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'libraryAssets', assetId));
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
                    <DialogTitle>{isEditing ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details and upload the file for the asset.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
                        <Label>File</Label>
                        <div className="flex items-center gap-2">
                           <Input id="fileUrl" value={currentAsset.fileUrl || ''} readOnly placeholder="Upload a file to get a URL" />
                           <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Upload</Button>
                           <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleSave}>Save Asset</Button>
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
                    <img src={asset.fileUrl} alt={asset.title} className="rounded-md max-h-48 object-contain mx-auto" />
                   )}
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2 pt-4">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(asset)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(asset.id)}><Trash2 className="h-4 w-4" /></Button>
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
