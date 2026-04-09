'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { User } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UpdateUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateUserModal({
  user,
  isOpen,
  onClose,
}: UpdateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      password: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [isOpen, user, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      // Clean up empty password before sending
      const payload: any = { ...values };
      if (!payload.password) delete payload.password;
      if (!payload.email) delete payload.email;

      const response = await api.put(`/api/v1/users/${user.id}`, payload);
      
      if (response.data.success || response.status === 200) {
        toast.success('User updated successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        onClose();
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong while updating user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-indigo-50 p-6">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-2">
            <UserCircle2 className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Edit User Profile
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-base leading-relaxed">
            Update user information and credentials. Leave password blank to keep current one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">
            <div className="grid grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="johndoe" 
                          {...field} 
                          className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john@example.com" 
                          {...field} 
                          className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 border-t gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-11 px-8 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
