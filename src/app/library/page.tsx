
'use client';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/header';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { LibraryAsset } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { File, Video, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const AssetIcon = ({ type }: { type: LibraryAsset['type'] }) => {
  switch (type) {
    case 'video':
      return <Video className="h-8 w-8 text-red-500" />;
    case 'image':
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    case 'document':
      return <File className="h-8 w-8 text-gray-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

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


function LibraryPageContent() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | LibraryAsset['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const assetsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'libraryAssets'), orderBy('createdAt', 'desc')) : null),
    [firestore, user]
  );
  
  const { data: assets, isLoading } = useCollection<LibraryAsset>(assetsQuery);
  
  const filteredAssets = assets
    ?.filter(asset => filter === 'all' || asset.type === filter)
    .filter(asset => asset.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const SkeletonCard = () => (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <Skeleton className="h-48 w-full rounded-md" />
      </CardContent>
      <CardFooter className="pt-4">
         <Skeleton className="h-6 w-20" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Asset Library</h1>
        <p className="text-muted-foreground mb-6">Find documents, images, and videos shared by the organization.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10">
          <Input 
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'image' ? 'default' : 'outline'} onClick={() => setFilter('image')}>Images</Button>
            <Button variant={filter === 'video' ? 'default' : 'outline'} onClick={() => setFilter('video')}>Videos</Button>
            <Button variant={filter === 'document' ? 'default' : 'outline'} onClick={() => setFilter('document')}>Documents</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets && filteredAssets.length > 0 ? filteredAssets.map(asset => (
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
                           <img src={asset.fileUrl} alt={asset.title} className="rounded-md max-h-48 object-contain cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col items-center justify-center p-2 sm:p-4">
                           <DialogHeader>
                                <DialogTitle>{asset.title}</DialogTitle>
                           </DialogHeader>
                           <img src={asset.fileUrl} alt={asset.title} className="max-w-full max-h-full object-contain" />
                           <DialogFooter className="mt-4">
                               <Button asChild>
                                   <a href={asset.fileUrl} download={`${asset.title.replace(/\s+/g, '_') || 'image'}.jpg`} target="_blank">
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
                        return (
                            <Dialog>
                                <DialogTrigger asChild disabled={!embedUrl}>
                                    <div className="relative flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg h-full cursor-pointer w-full aspect-video overflow-hidden">
                                        {embedUrl ? (
                                            <>
                                                <iframe 
                                                    src={embedUrl}
                                                    className="absolute inset-0 w-full h-full pointer-events-none" 
                                                    title={asset.title}
                                                ></iframe>
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Video className="h-16 w-16 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-center opacity-50">
                                                <Video className="h-16 w-16 text-muted-foreground" />
                                                <span className="mt-2 text-sm font-medium">Video Unavailable</span>
                                            </div>
                                        )}
                                    </div>
                                </DialogTrigger>
                                {embedUrl && (
                                <DialogContent className="max-w-4xl w-[90vw] aspect-video flex flex-col p-2 sm:p-4">
                                    <DialogHeader>
                                        <DialogTitle>{asset.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="w-full flex-1 rounded-md bg-black flex items-center justify-center">
                                        <iframe 
                                            src={embedUrl}
                                            className="w-full h-full"
                                            title={asset.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </DialogContent>
                                )}
                            </Dialog>
                        );
                    })()
                  )}
                   {asset.type === 'document' && asset.fileUrl && (
                     <Dialog>
                        <DialogTrigger asChild>
                           <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg h-full cursor-pointer w-full">
                                <File className="h-16 w-16 text-muted-foreground" />
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
                <CardFooter className="flex-col items-start gap-2 pt-4">
                  <Badge variant="secondary" className="capitalize">{asset.type}</Badge>
                </CardFooter>
              </Card>
            )) : (
              <p className="text-muted-foreground col-span-full text-center">No assets found matching your criteria.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AuthProvider>
      <LibraryPageContent />
    </AuthProvider>
  );
}

    
