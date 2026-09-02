import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DeleteAccountDialog({ userEmail }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleting(true);
    setError('');
    try {
      await base44.functions.invoke('deleteAccount', {});
      await base44.auth.logout('/');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-full py-3 rounded-xl border border-bearish/30 text-bearish hover:bg-bearish/10 transition-all flex items-center justify-center gap-2 text-sm">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border/60">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-bearish" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will permanently delete your subscription records, notification contacts, and all associated account data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-sm text-bearish bg-bearish/10 border border-bearish/30 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-muted-foreground">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-bearish text-white hover:bg-bearish/90"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}