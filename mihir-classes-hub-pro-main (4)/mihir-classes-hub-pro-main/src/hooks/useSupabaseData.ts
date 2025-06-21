
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export function useSupabaseData<T extends TableName>(
  tableName: T,
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<TableRow<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchData = async () => {
    try {
      let query = supabase.from(tableName).select('*');
      
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      
      const { data: result, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Failed to load ${tableName}`,
          variant: "destructive",
        });
        return;
      }
      
      setData((result || []) as unknown as TableRow<T>[]);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      console.log(`Removing existing channel for ${tableName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `${tableName}_changes_${Date.now()}_${Math.random()}`;
    
    // Set up real-time subscription with proper event handling
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`Real-time change detected for ${tableName}:`, payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setData(prevData => {
              const newRecord = payload.new as unknown as TableRow<T>;
              // Check if record already exists to avoid duplicates
              const exists = prevData.some(item => (item as any).id === (newRecord as any).id);
              if (!exists) {
                return [...prevData, newRecord];
              }
              return prevData;
            });
          } else if (payload.eventType === 'UPDATE') {
            setData(prevData => {
              return prevData.map(item => 
                (item as any).id === (payload.new as any).id 
                  ? payload.new as unknown as TableRow<T>
                  : item
              );
            });
          } else if (payload.eventType === 'DELETE') {
            setData(prevData => {
              return prevData.filter(item => (item as any).id !== (payload.old as any).id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${tableName}:`, status);
      });

    // Store the channel reference
    channelRef.current = channel;

    return () => {
      console.log(`Cleaning up subscription for ${tableName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [tableName]); // Only depend on tableName, not orderBy to avoid unnecessary re-subscriptions

  const addItem = async (item: Omit<TableInsert<T>, 'id' | 'created_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([item as any])
        .select()
        .single();

      if (error) {
        console.error(`Error adding to ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Failed to add item to ${tableName}`,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Item added successfully!",
      });

      return result as unknown as TableRow<T>;
    } catch (error) {
      console.error(`Error adding to ${tableName}:`, error);
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<TableUpdate<T>>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(updates as any)
        .eq('id' as any, id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Failed to update item in ${tableName}`,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Item updated successfully!",
      });

      return result as unknown as TableRow<T>;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      return null;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id' as any, id);

      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Failed to delete item from ${tableName}`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });

      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return false;
    }
  };

  return {
    data,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchData,
  };
}
