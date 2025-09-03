import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
}

export function StudentForm({ student, open, onOpenChange, onSubmit }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
    },
  });

  const handleFormSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: `Student ${student ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${student ? 'update' : 'create'} student. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-lg text-blue-900 dark:text-blue-100">
                {student ? 'Edit Student' : 'Add New Student'}
              </SheetTitle>
              <SheetDescription className="text-sm text-blue-600 dark:text-blue-300">
                {student 
                  ? 'Update the student information below.'
                  : 'Enter the student information to create a new record.'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter student's full name"
                  {...register('name')}
                  disabled={isSubmitting}
                  className={cn(
                    "bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800",
                    errors.name && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter student's email address"
                  {...register('email')}
                  disabled={isSubmitting}
                  className={cn(
                    "bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800",
                    errors.email && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isSubmitting 
                  ? (student ? 'Updating...' : 'Creating...') 
                  : (student ? 'Update Student' : 'Create Student')
                }
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}