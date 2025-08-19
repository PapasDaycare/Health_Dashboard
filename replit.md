# Overview

This is a healthcare management web application built with React, Express, and PostgreSQL. The application allows users to manage their physicians, schedule appointments, and set reminders for medical appointments. It features a modern dashboard interface with complete CRUD operations for healthcare-related data management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with JSON responses
- **Data Validation**: Zod schemas shared between client and server
- **Development**: Hot module replacement with Vite integration
- **Error Handling**: Centralized error middleware with structured responses

## Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for users, physicians, appointments, and reminders
- **Migrations**: Drizzle Kit for database schema management
- **Fallback Storage**: In-memory storage implementation for development

## Authentication and Authorization
- **Current Implementation**: Mock authentication with demo user
- **User Context**: Simple auth context providing user information
- **Session Management**: Basic user session handling (expandable for real auth)

## External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens
- **Development Tools**: Vite with React plugins and runtime error overlay
- **Date Handling**: date-fns for date formatting and manipulation
- **Icons**: Lucide React for consistent iconography