import { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RegistrationForm } from '@/components/registrations/RegistrationForm';
import { apiService } from '@/services/api';
import { Registration } from '@/types';

export default function Registrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    const filtered = registrations.filter(registration =>
      registration.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm]);

  const loadRegistrations = async () => {
    try {
      const data = await apiService.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegistration = () => {
    setSelectedRegistration(null);
    setIsFormOpen(true);
  };

  const handleEditRegistration = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsFormOpen(true);
  };

  const handleDeleteRegistration = async (registration: Registration) => {
    if (window.confirm(`Are you sure you want to delete the registration for ${registration.student.name} in ${registration.course.title}?`)) {
      try {
        await apiService.deleteRegistration(registration.id);
        toast({
          title: "Success",
          description: "Registration deleted successfully",
        });
        loadRegistrations();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete registration",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (data: { studentId: number; courseId: number; registrationDate: string }) => {
    if (selectedRegistration) {
      await apiService.updateRegistration(selectedRegistration.id, data);
    } else {
      await apiService.createRegistration(data as any);
    }
    loadRegistrations();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registrations</h1>
            <p className="text-muted-foreground">
              Manage student course registrations
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registrations</h1>
          <p className="text-muted-foreground">
            Manage student course registrations
          </p>
        </div>
        <Button onClick={handleAddRegistration}>
          <Plus className="mr-2 h-4 w-4" />
          New Registration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Registration Management
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
          <CardDescription>
            {filteredRegistrations.length} registration{filteredRegistrations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No registrations found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first registration.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">{registration.student.name}</TableCell>
                    <TableCell>{registration.student.studentNumber}</TableCell>
                    <TableCell>{registration.course.code} - {registration.course.title}</TableCell>
                    <TableCell>{format(new Date(registration.registrationDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRegistration(registration)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRegistration(registration)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RegistrationForm
        registration={selectedRegistration}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}