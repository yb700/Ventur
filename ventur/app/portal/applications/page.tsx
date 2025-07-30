/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/applications/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trash2, Send, Info, Loader2, FolderPlus, ChevronsUpDown } from 'lucide-react';
import { Database } from '@/types/supabase';

// Type definitions based on your Supabase schema
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type BucketRow = Database['public']['Tables']['buckets']['Row'];

type BucketItem = {
    id: string; // application_id
    application: ApplicationRow;
};

/**
 * "My Saved Applications" page with multi-bucket support.
 * Displays applications from a selected bucket and allows bucket management.
 */
export default function SavedApplicationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // State for bucket management
    const [buckets, setBuckets] = useState<BucketRow[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<BucketRow | null>(null);
    const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);

    // UI & Form State
    const [loading, setLoading] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [newBucketName, setNewBucketName] = useState('');
    const [isCreatingBucket, setIsCreatingBucket] = useState(false);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetches the list of all user's buckets
    const fetchBuckets = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('buckets')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setBuckets(data || []);
            if (data && data.length > 0) {
                setSelectedBucket(data[0]); // Select the first bucket by default
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
            showNotification('Failed to load your buckets.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetches applications for the currently selected bucket
    useEffect(() => {
        const fetchBucketItems = async () => {
            if (!selectedBucket) {
                setBucketItems([]);
                return;
            }
            setLoadingItems(true);
            try {
                const { data, error } = await supabase
                    .from('bucket_applications')
                    .select('applications (*)')
                    .eq('bucket_id', selectedBucket.id);

                if (error) throw error;

                const formattedItems = data
                    .map(item => ({
                        id: (item.applications as any).id,
                        application: item.applications as any,
                    }))
                    .filter(item => item.application);

                setBucketItems(formattedItems);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                showNotification(`Failed to load items for "${selectedBucket.title}".`, 'error');
            } finally {
                setLoadingItems(false);
            }
        };

        fetchBucketItems();
    }, [selectedBucket]);

    // Initial user and bucket load
    useEffect(() => {
        const init = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                setUser(currentUser);
                fetchBuckets(currentUser);
            } else {
                router.push('/auth/login');
            }
        };
        init();
    }, [router, fetchBuckets]);

    const handleCreateBucket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newBucketName.trim()) return;
        setIsCreatingBucket(true);
        try {
            const { data, error } = await supabase
                .from('buckets')
                .insert({ user_id: user.id, title: newBucketName.trim() })
                .select()
                .single();

            if (error) throw error;

            showNotification(`Bucket "${data.title}" created!`, 'success');
            setBuckets([data, ...buckets]);
            setSelectedBucket(data); // Automatically select the new bucket
            setNewBucketName('');
            (document.getElementById('create_bucket_modal') as HTMLDialogElement)?.close();
        } catch (error: any) {
            showNotification(`Error creating bucket: ${error.message}`, 'error');
        } finally {
            setIsCreatingBucket(false);
        }
    };

    const handleRemoveFromBucket = async (applicationId: string) => {
        if (!user || !selectedBucket) return;
        setRemovingId(applicationId);
        try {
            const { error } = await supabase
                .from('bucket_applications')
                .delete()
                .eq('bucket_id', selectedBucket.id)
                .eq('application_id', applicationId);

            if (error) throw error;
            showNotification('Application removed from bucket.', 'success');
            setBucketItems(prev => prev.filter(item => item.id !== applicationId));
        } catch (error: any) {
            showNotification(`Error removing item: ${error.message}`, 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const handleSendLetters = () => {
        if (!selectedBucket) return;
        // Pass the selected bucket ID to the send page
        router.push(`/portal/send?bucketId=${selectedBucket.id}`);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Saved Applications</h1>
                    <p className="text-base-content/70">Manage your buckets and the applications within them.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSendLetters}
                    disabled={!selectedBucket || bucketItems.length === 0 || loading}
                >
                    <Send className="w-4 h-4 mr-2" />
                    Send Letters to Bucket ({bucketItems.length})
                </button>
            </div>

            {/* Bucket Controls */}
            <div className="card bg-base-100 shadow-sm mb-6">
                <div className="card-body flex-col md:flex-row md:items-center gap-4">
                    <div className="dropdown w-full md:flex-grow">
                        <label tabIndex={0} className="btn btn-outline w-full justify-between">
                            {selectedBucket ? selectedBucket.title : 'Select a Bucket'}
                            <ChevronsUpDown className="w-4 h-4" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-1">
                            {buckets.map(bucket => (
                                <li key={bucket.id}><a onClick={() => setSelectedBucket(bucket)} className={selectedBucket?.id === bucket.id ? 'active' : ''}>{bucket.title}</a></li>
                            ))}
                        </ul>
                    </div>
                    <button className="btn btn-secondary w-full md:w-auto" onClick={() => (document.getElementById('create_bucket_modal') as HTMLDialogElement)?.showModal()}>
                        <FolderPlus className="w-4 h-4" /> Create New Bucket
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && <div className={`toast toast-top toast-center z-50`}><div className={`alert alert-${notification.type}`}><span>{notification.message}</span></div></div>}

            {/* Saved Applications List */}
            {loading ? <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div> : (
                <div className="overflow-x-auto bg-base-100 rounded-lg shadow-sm">
                    <table className="table">
                        <thead><tr><th>Address & Reference</th><th>Proposal</th><th>Council</th><th className="text-right">Action</th></tr></thead>
                        <tbody>
                            {loadingItems ? Array.from({ length: 3 }).map((_, i) => <tr key={i}>
                                <td><div className="skeleton h-4 w-48"></div><div className="skeleton h-3 w-32 mt-2"></div></td>
                                <td><div className="skeleton h-4 w-full"></div></td><td><div className="skeleton h-4 w-24"></div></td>
                                <td><div className="skeleton h-8 w-24 float-right"></div></td></tr>)
                                : bucketItems.length > 0 ? bucketItems.map(item => (
                                    <tr key={item.id} className="hover">
                                        <td><div className="font-bold">{item.application.address}</div><div className="text-sm opacity-50">{item.application.reference}</div></td>
                                        <td className="max-w-md whitespace-normal">{item.application.proposal}</td>
                                        <td><span className="badge badge-ghost">{item.application.council_id}</span></td>
                                        <td className="text-right">
                                            <button className="btn btn-error btn-sm btn-ghost" onClick={() => handleRemoveFromBucket(item.id)} disabled={removingId === item.id}>
                                                {removingId === item.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />} Remove
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center p-8">
                                        <Info className="w-8 h-8 mx-auto text-base-content/30 mb-2" />
                                        <h3 className="font-bold">{selectedBucket ? `Bucket "${selectedBucket.title}" is empty.` : 'No bucket selected.'}</h3>
                                        <p className="text-sm text-base-content/60">{selectedBucket ? 'Go to the dashboard to add applications.' : 'Select or create a bucket to get started.'}</p>
                                    </td></tr>
                                )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Bucket Modal */}
            <dialog id="create_bucket_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create a New Bucket</h3>
                    <form onSubmit={handleCreateBucket}>
                        <div className="form-control py-4">
                            <label className="label"><span className="label-text">Bucket Name</span></label>
                            <input type="text" placeholder="e.g., 'Hillingdon High Street Apps'" className="input input-bordered" value={newBucketName} onChange={e => setNewBucketName(e.target.value)} required />
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={() => (document.getElementById('create_bucket_modal') as HTMLDialogElement)?.close()}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isCreatingBucket}>
                                {isCreatingBucket && <span className="loading loading-spinner"></span>} Create
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
