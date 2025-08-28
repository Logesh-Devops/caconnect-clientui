import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Plus, Share2, Folder, FolderPlus, ArrowLeft, Search, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth.jsx';
import { getDocuments, createFolder, uploadFile, deleteDocument, shareDocument, viewFile } from '@/lib/api';

const buildFileTree = (items) => {
  const tree = { id: 'root', name: 'Root', is_folder: true, children: [] };
  const map = { root: tree };

  items.forEach(item => {
    map[item.id] = { ...item, children: item.is_folder ? [] : undefined };
  });

  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      if(map[item.parent_id].children) {
        map[item.parent_id].children.push(map[item.id]);
      }
    } else {
      tree.children.push(map[item.id]);
    }
  });

  return tree;
};


const findPath = (root, id) => {
  const path = [];
  function search(node) {
    if (node.id === id) {
      path.push(node);
      return true;
    }
    if (node.is_folder) {
      path.push(node);
      for (const child of node.children) {
        if (search(child)) {
          return true;
        }
      }
      path.pop();
    }
    return false;
  }
  search(root);
  return path;
};

const Documents = ({ entityId }) => {
  const [documentsState, setDocumentsState] = useState({ id: 'root', name: 'Root', is_folder: true, children: [] });
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchDocuments = useCallback(async (isRefresh = false) => {
    if (!entityId || !user?.access_token) return;
    if (isRefresh) {
        setIsRefreshing(true);
    } else {
        setIsLoading(true);
    }
    try {
        const data = await getDocuments(entityId, user.access_token);
        const fileTree = buildFileTree(data || []);
        setDocumentsState(fileTree);
    } catch (error) {
        toast({
            title: 'Error',
            description: `Failed to fetch documents: ${error.message}`,
            variant: 'destructive',
        });
        setDocumentsState({ id: 'root', name: 'Root', is_folder: true, children: [] });
    } finally {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  }, [entityId, user?.access_token, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);


  const currentPath = useMemo(() => findPath(documentsState, currentFolderId), [documentsState, currentFolderId]);
  const currentFolder = currentPath[currentPath.length - 1];

  const filteredChildren = useMemo(() => {
    if (!currentFolder || !currentFolder.children) return [];
    if (!searchTerm) return currentFolder.children;
    return currentFolder.children.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentFolder, searchTerm]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!entityId) return;

    const formData = new FormData(e.target);
    const file = formData.get('file');
    if (!file || file.size === 0) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    try {
        await uploadFile(currentFolderId, entityId, file, user.access_token);
        toast({ title: "Document Uploaded", description: "New document has been successfully added." });
        setShowUpload(false);
        e.target.reset();
        fetchDocuments(true);
    } catch (error) {
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({ title: "Invalid Name", description: "Folder name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
        await createFolder(newFolderName, entityId, currentFolderId, user.access_token);
        toast({ title: "Folder Created", description: `Folder "${newFolderName}" has been created.` });
        setShowCreateFolder(false);
        setNewFolderName('');
        fetchDocuments(true);
    } catch (error)
        {
        toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (itemId) => {
    try {
        await deleteDocument(itemId, user.access_token);
        toast({ title: "Item Deleted", description: "The selected item has been removed." });
        fetchDocuments(true);
    } catch (error) {
        toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleShareClick = (doc) => {
    setShareDoc(doc);
    setShareDialogOpen(true);
  };

  const handleConfirmShare = async () => {
    if (!shareEmail) {
      toast({ title: "Email required", description: "Please enter an email address to share.", variant: "destructive" });
      return;
    }
    try {
        await shareDocument(shareDoc.id, shareEmail, user.access_token);
        toast({ title: "Sharing Document", description: `Sharing ${shareDoc.name} with ${shareEmail}.` });
        setShareDialogOpen(false);
        setShareEmail('');
        setShareDoc(null);
    } catch (error) {
        toast({ title: "Share Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleView = async (doc) => {
    toast({ title: "Loading...", description: `Opening ${doc.name}.` });
    try {
        const fileBlob = await viewFile(doc.id, user.access_token);
        const fileURL = URL.createObjectURL(fileBlob);
        window.open(fileURL, '_blank');
    } catch (error) {
        toast({ title: "Failed to open file", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-5xl font-bold text-white">Documents</h1>
          <div className="flex items-center space-x-2 w-full md:w-auto">
             <Button variant="outline" size="icon" onClick={() => fetchDocuments(true)} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
             <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search current folder..." className="pl-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={() => setShowCreateFolder(true)} variant="outline">
              <FolderPlus className="w-5 h-5 mr-2" /> Folder
            </Button>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="w-5 h-5 mr-2" /> Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-400 mb-8">
          {currentFolderId !== 'root' && currentPath.length > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setCurrentFolderId(currentPath[currentPath.length - 2].id)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          {currentPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <span onClick={() => setCurrentFolderId(folder.id)} className="cursor-pointer hover:text-white transition-colors">{folder.name}</span>
              {index < currentPath.length - 1 && <span className="text-gray-600">/</span>}
            </React.Fragment>
          ))}
        </div>

        <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
            <DialogContent>
                <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
                <div className="py-4">
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Enter folder name" />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowCreateFolder(false)}>Cancel</Button>
                    <Button onClick={handleCreateFolder}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogContent>
                <DialogHeader><DialogTitle>Upload Document to {currentFolder?.name}</DialogTitle></DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="file">Select File</Label>
                        <Input id="file" name="file" type="file" required />
                    </div>
                    <DialogFooter>
                       <Button variant="ghost" type="button" onClick={() => setShowUpload(false)}>Cancel</Button>
                       <Button type="submit"><Upload className="w-4 h-4 mr-2" />Upload</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChildren.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
                <Card className="glass-card card-hover" onDoubleClick={item.is_folder ? () => setCurrentFolderId(item.id) : () => handleView(item)}>
                    <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.is_folder ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-sky-500 to-indigo-500'}`}>
                        {item.is_folder ? <Folder className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{item.name}</CardTitle>
                        {!item.is_folder && <CardDescription>{item.file_type} • {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : ''}</CardDescription>}
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="flex space-x-2">
                        {!item.is_folder && (
                        <>
                            <Button size="icon" variant="outline" onClick={(e) => {e.stopPropagation(); handleShareClick(item)}}><Share2 className="w-4 h-4" /></Button>
                            <Button size="icon" variant="outline" onClick={(e) => {e.stopPropagation(); handleView(item)}}><FileText className="w-4 h-4" /></Button>
                        </>
                        )}
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    </CardContent>
                </Card>
                </motion.div>
            ))}
            {filteredChildren.length === 0 && (
                <div className="text-center py-12 col-span-full">
                <p className="text-gray-400">{searchTerm ? 'No items found matching your search.' : 'This folder is empty.'}</p>
                </div>
            )}
            </div>
        )}
      </motion.div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p>Sharing: <span className="font-semibold">{shareDoc?.name}</span></p>
            <Label htmlFor="share-email">Email Address</Label>
            <Input id="share-email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="Enter email to share with" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmShare}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;