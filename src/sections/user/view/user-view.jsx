/* eslint-disable */

import axios from 'axios';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function UserView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(response.data.data);
        setLoading(false);
      } catch (fetchError) {
        console.error('Error al obtener los usuarios:', fetchError);
        setApiError('Error al cargar los usuarios');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const toggleDrawer =
    (open, user = null) =>
    (event) => {
      setOpenDrawer(open);
      setIsEditing(!!user);

      if (user) {
        setName(user.nombre);
        setEmail(user.email);
        setPassword('');
        setEditingUserId(user.id);
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setEditingUserId(null);
      }

      setNameError(false);
      setEmailError(false);
      setPasswordError(false);
    };

  const validateUserForm = () => {
    let valid = true;

    if (!name) {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (!email) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!password && !isEditing) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    return valid;
  };

  const handleCreateOrUpdateUser = async () => {
    if (!validateUserForm()) {
      return;
    }

    const userPayload = {
      nombre: name,
      email,
      password,
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}user/${editingUserId}`, userPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}user`, userPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      setOpenDrawer(false);

      const updatedUsersResponse = await axios.get(`${API_BASE_URL}user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(updatedUsersResponse.data.data);
    } catch (createOrUpdateUserError) {
      console.error('Error al registrar o actualizar el usuario:', createOrUpdateUserError);
      alert('Error al registrar o actualizar el usuario, por favor verifica los datos.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}user/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedUsersResponse = await axios.get(`${API_BASE_URL}user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(updatedUsersResponse.data.data);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Error al eliminar el usuario.');
    }
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (apiError) {
    return <div>{apiError}</div>;
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Lista de Usuarios</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={toggleDrawer(true)}
        >
          Crear nuevo usuario
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'nombre', label: 'Nombre' },
                  { id: 'email', label: 'Correo Electrónico' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      id={row.id}
                      name={row.nombre}
                      email={row.email}
                      selected={selected.indexOf(row.nombre) !== -1}
                      onEdit={toggleDrawer(true, row)}
                      onDelete={() => handleDeleteUser(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Drawer anchor="right" open={openDrawer} onClose={toggleDrawer(false)}>
        <Container sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Editar usuario' : 'Registrar nuevo usuario'}
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nombre"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              helperText={nameError ? 'Completar este campo' : ''}
            />
            <TextField
              label="Correo Electrónico"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? 'Completar este campo' : ''}
            />

            <TextField
              label="Contraseña"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordError ? 'Completar este campo' : ''}
            />

            <Button variant="contained" onClick={handleCreateOrUpdateUser}>
              {isEditing ? 'Actualizar' : 'Registrar'}
            </Button>
          </Stack>
        </Container>
      </Drawer>
    </Container>
  );
}
