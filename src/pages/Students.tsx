import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';
import { StudentForm } from '@/components/students/StudentForm';
import { apiService } from '@/services/api';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students whenever searchTerm or students changes
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (student.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  // Fetch students from backend
  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const studentsFromAPI = await apiService.getStudents();
      setStudents(studentsFromAPI);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open create form
  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsCreateFormOpen(true);
  };

  // Open edit form
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditFormOpen(true);
  };

  // Delete student
  const handleDeleteStudent = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      await apiService.deleteStudent(student.id);
      toast({
        title: "Student deleted",
        description: `${student.name} has been removed from the system`,
      });
      setStudents(students.filter(s => s.id !== student.id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  // Submit form (create or update)
  const handleFormSubmit = async (studentData: { name: string; email: string }) => {
    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudent = await apiService.updateStudent(editingStudent.id, studentData);
        setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        toast({
          title: "Student updated",
          description: `${updatedStudent.name}'s information has been updated`,
        });
      } else {
        // Create new student
        const fullStudentData = {
          ...studentData,
          role: 'student',
          // Optionally generate studentNumber here if backend doesn't
          studentNumber: `S${String(Date.now()).slice(-6)}`,
        };
        const newStudent = await apiService.createStudent(fullStudentData);
        setStudents([...students, newStudent]);
        toast({
          title: "Student added",
          description: `${newStudent.name} has been added to the system`,
        });
      }
      closeForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    }
  };

  const closeForm = () => {
    setIsCreateFormOpen(false);
    setIsEditFormOpen(false);
    setEditingStudent(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">
            Manage student information and enrollment
          </p>
        </div>
        <Button onClick={handleAddStudent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            Search and manage all registered students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or student number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentNumber || 'N/A'}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStudent(student)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Forms */}
      <StudentForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSubmit={handleFormSubmit}
      />
      <StudentForm
        student={editingStudent}
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
