import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, Search } from '../components/ui';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');

  // Simular datos hasta tener la API conectada
  const mockUsers = [
    { id: 1, full_name: 'Juan Pérez', email: 'juan@example.com', rol: 'student', created_at: '2024-01-15' },
    { id: 2, full_name: 'María García', email: 'maria@example.com', rol: 'teacher', created_at: '2024-01-10' },
    { id: 3, full_name: 'Carlos López', email: 'carlos@example.com', rol: 'admin', created_at: '2024-01-05' },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (rol) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800'
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-2 text-gray-600">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            Nuevo Usuario
          </Button>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent>
            <Search
              placeholder="Buscar usuarios por nombre, email o rol..."
              onSearch={setSearchQuery}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Usuarios ({filteredUsers.length})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.rol)}`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  No se encontraron usuarios
                  {searchQuery && ` para "${searchQuery}"`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}