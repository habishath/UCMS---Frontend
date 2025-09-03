import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/types';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  code: z.string()
    .min(3, 'Course code must be at least 3 characters')
    .regex(/^[A-Z]+[0-9]+$/, 'Course code must be letters followed by numbers (e.g., CS101)'),
  credits: z.number()
    .min(1, 'Credits must be at least 1')
    .max(6, 'Credits cannot exceed 6'),
  instructor: z.string().min(2, 'Instructor name must be at least 2 characters')
}).transform((data) => ({
  ...data,
  credits: Number(data.credits)
}));

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Course>) => Promise<void>;
}

export function CourseForm({ course, open, onOpenChange, onSubmit }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      code: course?.code || '',
      credits: course?.credits || 3,
      instructor: course?.instructor || ''
    }
  });

  const handleSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: `Course ${course ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${course ? 'update' : 'create'} course. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-lg text-blue-900 dark:text-blue-100">
                {course ? 'Edit Course' : 'Add New Course'}
              </SheetTitle>
              <SheetDescription className="text-sm text-blue-600 dark:text-blue-300">
                {course 
                  ? 'Update the course information below.'
                  : 'Enter the course information to create a new record.'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Course Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Introduction to Computer Science"
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Course Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CS101"
                            {...field}
                            disabled={isSubmitting}
                            style={{ textTransform: 'uppercase' }}
                            className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Credits</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="6"
                              placeholder="3"
                              {...field}
                              disabled={isSubmitting}
                              className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Instructor</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dr. John Smith"
                              {...field}
                              disabled={isSubmitting}
                              className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}