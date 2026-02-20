import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

import { RequireAuth } from './components/RequireAuth.jsx';
import { SidebarLayout } from './components/SidebarLayout.jsx';

import { Landing } from './pages/Landing.jsx';
import { AdminLogin, SuperAdminLogin } from './pages/auth/AdminLogin.jsx';
import { ClientLogin } from './pages/auth/ClientLogin.jsx';
import { UserLogin } from './pages/auth/UserLogin.jsx';
import { UserRegister } from './pages/auth/UserRegister.jsx';
import { AdminRegister } from './pages/auth/AdminRegister.jsx';
import { ClientRegister } from './pages/auth/ClientRegister.jsx';

import { SuperAdminDashboard } from './pages/super/SuperAdminDashboard.jsx';
import { AdminsList } from './pages/super/AdminsList.jsx';
import { SuperClientsList } from './pages/super/ClientsList.jsx';
import { SuperUsersList } from './pages/super/UsersList.jsx';
import { CreateAdmin } from './pages/super/CreateAdmin.jsx';
import { CreateClient } from './pages/shared/CreateClient.jsx';
import { CreateUser as SuperCreateUser } from './pages/super/CreateUser.jsx';
import { SuperAdminProfile } from './pages/super/SuperAdminProfile.jsx';

import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminClients } from './pages/admin/AdminClients.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminCreateUser } from './pages/admin/CreateUser.jsx';
import { AdminProfile } from './pages/admin/AdminProfile.jsx';

import { ClientDashboard } from './pages/client/ClientDashboard.jsx';
import { ClientUsers } from './pages/client/ClientUsers.jsx';
import { ClientCreateUser } from './pages/client/CreateUser.jsx';
import { ClientProfile } from './pages/client/ClientProfile.jsx';

import { UserDashboard } from './pages/user/UserDashboard.jsx';
import { UserProfile } from './pages/user/UserProfile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />

        {/* Super Admin */}
        <Route element={<RequireAuth allowSubjectTypes={['admin']} allowRoles={['super_admin']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/admins" element={<AdminsList />} />
            <Route path="/super-admin/clients" element={<SuperClientsList />} />
            <Route path="/super-admin/users" element={<SuperUsersList />} />
            <Route path="/super-admin/create-admin" element={<CreateAdmin />} />
            <Route path="/super-admin/create-client" element={<CreateClient />} />
            <Route path="/super-admin/create-user" element={<SuperCreateUser />} />
            <Route path="/super-admin/profile" element={<SuperAdminProfile />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RequireAuth allowSubjectTypes={['admin']} allowRoles={['admin']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/create-client" element={<CreateClient />} />
            <Route path="/admin/create-user" element={<AdminCreateUser />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Client */}
        <Route element={<RequireAuth allowSubjectTypes={['client']} allowRoles={['client']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/users" element={<ClientUsers />} />
            <Route path="/client/create-user" element={<ClientCreateUser />} />
            <Route path="/client/profile" element={<ClientProfile />} />
          </Route>
        </Route>

        {/* User */}
        <Route element={<RequireAuth allowSubjectTypes={['user']} allowRoles={['user']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<UserProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
