# **App Name**: Marketplace Admin Hub

## Core Features:

- User Management: User Management Dashboard: Provides a central interface to view, create, update, and delete user accounts for buyers, sellers, and administrators, calling the appropriate API endpoints.
- Authentication: Authentication Handling: Manages user authentication via API calls to register, login, logout, verify email, and retrieve user profiles.
- Role Management: Role-Based Access Control: Implements different views and permissions based on user roles (buyer, seller, admin), ensuring appropriate access to management functions. This will be handled via API calls

## Style Guidelines:

- Primary color: Neutral gray (#F4F4F5) for a clean, professional look.
- Secondary color: Dark blue (#3F51B5) for headers and important elements.
- Accent: Teal (#009688) for interactive elements and highlights.
- Clear and readable sans-serif fonts for all text.
- Well-spaced layout with clear sections for each user role.
- Use consistent and easily recognizable icons for user actions (edit, delete, add).

## Original User Request:
une web app d'administration pour gérer les utilisateurs d'une plateforme de gestion de marchés. acteurs à prendre en compte : acheteurs, vendeurs, gestionnaires. La gestion des utilisateurs se fera par appels API. endpoints : 
Administration (CRUD utilisateurs par rôle)
GET/POST app/api/admin/acheteurs
GET/PUT/DELETE app/api/admin/acheteurs/[id]
GET/POST app/api/admin/vendeurs
GET/PUT/DELETE app/api/admin/vendeurs/[id]
GET/POST app/api/admin/gestionnaires
GET/PUT/DELETE app/api/admin/gestionnaires/[id]
GET/PUT/DELETE app/api/admin/admins/[id]

Authentification & profil
POST app/api/auth/register
POST app/api/auth/login
POST app/api/auth/logout
GET app/api/auth/profile
POST app/api/auth/verify-email
  