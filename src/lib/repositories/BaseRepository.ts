import { supabase } from '../db/supabase';

export class BaseRepository<T extends { id?: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error finding by id in ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error finding all in ${this.tableName}:`, error);
      return [];
    }
    return data as T[];
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([item as any])
      .select()
      .single();

    if (error) {
      console.error(`Error creating in ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating in ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${this.tableName}:`, error);
      return false;
    }
    return true;
  }
}
