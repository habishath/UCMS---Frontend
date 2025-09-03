// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, Student, Course, Registration, Result } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api', // Backend API URL
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  // Students
  async getStudents(): Promise<Student[]> {
    const response: AxiosResponse<Student[]> = await this.api.get('/students');
    return response.data;
  }

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const response: AxiosResponse<Student> = await this.api.post('/students', student);
    return response.data;
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<Student> {
    const response: AxiosResponse<Student> = await this.api.put(`/students/${id}`, student);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.api.delete(`/students/${id}`);
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    const response: AxiosResponse<Course[]> = await this.api.get('/courses');
    return response.data;
  }

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.post('/courses', course);
    return response.data;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.put(`/courses/${id}`, course);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await this.api.delete(`/courses/${id}`);
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    const response: AxiosResponse<Registration[]> = await this.api.get('/registrations');
    return response.data;
  }

  async createRegistration(registration: { studentId: number; courseId: number; registrationDate: string }): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.api.post('/registrations', registration);
    return response.data;
  }

  async updateRegistration(id: number, registration: { studentId: number; courseId: number; registrationDate: string }): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.api.put(`/registrations/${id}`, registration);
    return response.data;
  }

  async deleteRegistration(id: number): Promise<void> {
    await this.api.delete(`/registrations/${id}`);
  }

  // Results
  async getResults(): Promise<Result[]> {
    const response: AxiosResponse<Result[]> = await this.api.get('/results');
    return response.data;
  }

  async createResult(result: { studentId: number; courseId: number; grade: string }): Promise<Result> {
    const response: AxiosResponse<Result> = await this.api.post('/results', result);
    return response.data;
  }

  async updateResult(id: number, result: { studentId: number; courseId: number; grade: string }): Promise<Result> {
    const response: AxiosResponse<Result> = await this.api.put(`/results/${id}`, result);
    return response.data;
  }

  async deleteResult(id: number): Promise<void> {
    await this.api.delete(`/results/${id}`);
  }
}

export const apiService = new ApiService();
