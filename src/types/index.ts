// Core types for the University Course Management System

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Student {
  id: number;
  studentNumber: string;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface Course {
  id: number;
  title: string;
  code: string;
  credits: number;
  instructor: string;
}

export interface Registration {
  id: number;
  student: Student;
  course: Course;
  registrationDate: string;
}

export interface RegistrationRequest {
  studentId: number;
  courseId: number;
  registrationDate: string;
}

export interface Result {
  id: number;
  studentNumber: string;
  courseCode: string;
  courseName: string;
  grade: string;
}

export interface ResultRequest {
  studentId: number;
  courseId: number;
  grade: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}