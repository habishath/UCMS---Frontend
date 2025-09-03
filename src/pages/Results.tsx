import { useState, useEffect } from 'react';
import { Award, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ResultForm } from '@/components/results/ResultForm';
import { apiService } from '@/services/api';
import { Result } from '@/types';

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'A-':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'B+':
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'B-':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'C+':
    case 'C':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'C-':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function Results() {
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    const filtered = results.filter(result =>
      result.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [results, searchTerm]);

  const loadResults = async () => {
    try {
      const data = await apiService.getResults();
      setResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResult = () => {
    setSelectedResult(null);
    setIsFormOpen(true);
  };

  const handleEditResult = (result: Result) => {
    setSelectedResult(result);
    setIsFormOpen(true);
  };

  const handleDeleteResult = async (result: Result) => {
    if (window.confirm(`Are you sure you want to delete the result for ${result.studentNumber} in ${result.courseCode}?`)) {
      try {
        await apiService.deleteResult(result.id);
        toast({
          title: "Success",
          description: "Result deleted successfully",
        });
        loadResults();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete result",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (data: { studentId: number; courseId: number; grade: string }) => {
    if (selectedResult) {
      await apiService.updateResult(selectedResult.id, data);
    } else {
      await apiService.createResult(data as any);
    }
    loadResults();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Results</h1>
            <p className="text-muted-foreground">
              Manage student grades and assessments
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
          <h1 className="text-3xl font-bold text-foreground">Results</h1>
          <p className="text-muted-foreground">
            Manage student grades and assessments
          </p>
        </div>
        <Button onClick={handleAddResult}>
          <Plus className="mr-2 h-4 w-4" />
          Record Result
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Results Management
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
          <CardDescription>
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by recording your first result.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.studentNumber}</TableCell>
                    <TableCell>{result.courseCode}</TableCell>
                    <TableCell>{result.courseName}</TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(result.grade)}>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditResult(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteResult(result)}
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

      <ResultForm
        result={selectedResult}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}