import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Result, Student, Course } from '@/types';

const gradeOptions = [
  { value: 'A+', label: 'A+', color: 'text-green-600' },
  { value: 'A', label: 'A', color: 'text-green-600' },
  { value: 'A-', label: 'A-', color: 'text-green-500' },
  { value: 'B+', label: 'B+', color: 'text-blue-600' },
  { value: 'B', label: 'B', color: 'text-blue-600' },
  { value: 'B-', label: 'B-', color: 'text-blue-500' },
  { value: 'C+', label: 'C+', color: 'text-yellow-600' },
  { value: 'C', label: 'C', color: 'text-yellow-600' },
  { value: 'C-', label: 'C-', color: 'text-yellow-500' },
  { value: 'D', label: 'D', color: 'text-orange-600' },
  { value: 'F', label: 'F', color: 'text-red-600' }
];

const resultSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  courseId: z.string().min(1, 'Please select a course'),
  grade: z.string().min(1, 'Please select a grade')
});

type ResultFormData = z.infer<typeof resultSchema>;

interface ResultFormProps {
  result?: Result | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { studentId: number; courseId: number; grade: string }) => Promise<void>;
}

export function ResultForm({ result, open, onOpenChange, onSubmit }: ResultFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentId: '',
      courseId: '',
      grade: result?.grade || ''
    }
  });

  useEffect(() => {
    if (open) {
      loadData();
      if (result) {
        // Find student and course by codes for existing result
        loadData().then(() => {
          const student = students.find(s => s.studentNumber === result.studentNumber);
          const course = courses.find(c => c.code === result.courseCode);
          if (student) form.setValue('studentId', student.id.toString());
          if (course) form.setValue('courseId', course.id.toString());
        });
      }
    }
  }, [open, result]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [studentsData, coursesData] = await Promise.all([
        apiService.getStudents(),
        apiService.getCourses()
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students and courses data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (data: ResultFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        studentId: parseInt(data.studentId),
        courseId: parseInt(data.courseId),
        grade: data.grade
      });
      toast({
        title: "Success",
        description: `Result ${result ? 'updated' : 'recorded'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${result ? 'update' : 'record'} result. Please try again.`,
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

  const getGradeColor = (grade: string) => {
    const gradeOption = gradeOptions.find(g => g.value === grade);
    return gradeOption?.color || 'text-foreground';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-lg text-blue-900 dark:text-blue-100">
                {result ? 'Edit Result' : 'Record Result'}
              </SheetTitle>
              <SheetDescription className="text-sm text-blue-600 dark:text-blue-300">
                {result 
                  ? 'Update the result information below.'
                  : 'Enter the result information to create a new record.'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Student</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800">
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name} ({student.studentNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Course</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.code} - {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-700 dark:text-blue-300">Grade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800">
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gradeOptions.map((grade) => (
                              <SelectItem key={grade.value} value={grade.value}>
                                <span className={getGradeColor(grade.value)}>
                                  {grade.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    {isSubmitting ? 'Saving...' : result ? 'Update Result' : 'Record Result'}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}