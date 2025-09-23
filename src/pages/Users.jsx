import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, Search, UserTableSkeleton } from '../components/ui';
import { UserModal, DeleteUserModal } from '../components/modals';
import { getUsers, createUser, updateUser, deleteUser } from '../services/node/users.service';
import { getRoleBadgeColor, getRoleDisplayName } from '../schemas/userSchemas';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const queryClient = useQueryClient();

  // Query para obtener usuarios
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    select: (data) => {
      console.log('Raw API response:', data); // Debug para ver la estructura
      // La función crud.get ya extrae data.data, así que solo necesitamos manejar el array
      return Array.isArray(data) ? data : data?.data || data || [];
    },
    onError: (error) => {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    }
  });

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.rol?.toLowerCase().includes(query) ||
      user.cellphone?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Definir columnas para TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: 'Usuario',
      cell: ({ row }) => (
        <div className="text-sm font-medium text-gray-900">
          {row.original.full_name}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(row.original.rol)}`}>
          {getRoleDisplayName(row.original.rol)}
        </span>
      ),
    },
    {
      accessorKey: 'cellphone',
      header: 'Teléfono',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.cellphone}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha de registro',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleEditUser(row.original)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => handleDeleteUser(row.original)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </Button>
        </div>
      ),
    },
  ], []);

  // Configuración de TanStack Table
  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Configuración del virtualizador para TanStack Virtual
  const { rows } = table.getRowModel();
  const parentRef = React.useRef();
  
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Altura estimada de cada fila
    overscan: 10,
  });

  // Mutaciones para CRUD
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      console.log('User created successfully:', data);
      queryClient.invalidateQueries(['users']);
      toast.success('Usuario creado exitosamente');
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al crear usuario');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateUser(id, data),
    onSuccess: (data) => {
      console.log('User updated successfully:', data);
      queryClient.invalidateQueries(['users']);
      toast.success('Usuario actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al actualizar usuario');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      console.log('User deleted successfully');
      queryClient.invalidateQueries(['users']);
      toast.success('Usuario eliminado exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || error.message || 'Error al eliminar usuario');
    }
  });

  // Handlers para modales
  const handleCreateUser = (userData) => {
    createUserMutation.mutate(userData);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (userData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, ...userData });
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (userId) => {
    deleteUserMutation.mutate(userId);
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
            <p className="text-gray-500 mb-4">Hubo un problema al conectar con el servidor</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="mt-2 text-gray-600">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </Button>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent>
            <Search
              placeholder="Buscar usuarios por nombre, email, rol o teléfono..."
              onSearch={setSearchQuery}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card className="border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100">
            <h3 className="text-lg font-medium text-gray-900">
              Usuarios ({filteredUsers.length})
            </h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UserTableSkeleton rows={8} />
            ) : (
              <>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      <p className="text-lg mb-2">
                        {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                      </p>
                      <p className="text-sm">
                        {searchQuery 
                          ? `No hay resultados para "${searchQuery}"`
                          : 'Comienza creando tu primer usuario'
                        }
                      </p>
                      {!searchQuery && (
                        <Button 
                          className="mt-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0"
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Crear Primer Usuario
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                          {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                <th 
                                  key={header.id}
                                  className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider"
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody 
                          ref={parentRef}
                          className="bg-white divide-y divide-gray-200"
                          style={{ 
                            height: rows.length > 10 ? '500px' : 'auto',
                            overflow: rows.length > 10 ? 'auto' : 'visible',
                          }}
                        >
                          {rows.length > 10 ? (
                            // Virtualización para listas grandes
                            <>
                              <tr>
                                <td colSpan={columns.length} className="p-0">
                                  <div
                                    style={{
                                      height: `${virtualizer.getTotalSize()}px`,
                                      width: '100%',
                                      position: 'relative',
                                    }}
                                  >
                                    {virtualizer.getVirtualItems().map((virtualRow) => {
                                      const row = rows[virtualRow.index];
                                      return (
                                        <div
                                          key={row.id}
                                          className="absolute inset-x-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 border-b border-gray-200 transition-colors duration-200"
                                          style={{
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                          }}
                                        >
                                          <div className="flex w-full">
                                            {row.getVisibleCells().map((cell, cellIndex) => (
                                              <div 
                                                key={cell.id}
                                                className="px-6 py-4 flex-1"
                                                style={{ 
                                                  minWidth: cellIndex === 0 ? '200px' : 
                                                           cellIndex === 1 ? '250px' :
                                                           cellIndex === 2 ? '120px' :
                                                           cellIndex === 3 ? '150px' :
                                                           cellIndex === 4 ? '150px' :
                                                           '200px'
                                                }}
                                              >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                              </tr>
                            </>
                          ) : (
                            // Renderizado normal para listas pequeñas
                            rows.map(row => (
                              <tr key={row.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors duration-200">
                                {row.getVisibleCells().map(cell => (
                                  <td 
                                    key={cell.id}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={createUserMutation.isPending}
      />

      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        isSubmitting={updateUserMutation.isPending}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isSubmitting={deleteUserMutation.isPending}
      />
    </Layout>
  );
}