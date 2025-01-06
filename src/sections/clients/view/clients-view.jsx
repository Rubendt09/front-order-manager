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
import ClientTableRow from '../client-table-row';
import ClientTableHead from '../client-table-head';
import TableEmptyRows from '../table-empty-rows';
import ClientTableToolbar from '../client-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function ClientsView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null); 
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setClients(response.data.data);
        setLoading(false);
      } catch (fetchError) {
        console.error('Error al obtener los clientes:', fetchError);
        setApiError('Error al cargar los clientes');
        setLoading(false);
      }
    };

    fetchClients();
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
    inputData: clients,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const toggleDrawer =
    (open, client = null) =>
    (event) => {
      setOpenDrawer(open);
      setIsEditing(!!client);

      if (client) {
        setName(client.nombre);
        setEmail(client.email);
        setPhone(client.telefono);
        setEditingClientId(client.id); // Almacenar el ID del cliente en edición
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setEditingClientId(null); // Reiniciar el ID si no se está editando
      }

      setNameError(false);
      setEmailError(false);
      setPhoneError(false);
    };

  const validateClientForm = () => {
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

    if (!phone) {
      setPhoneError(true);
      valid = false;
    } else {
      setPhoneError(false);
    }

    return valid;
  };

  const handleCreateOrUpdateClient = async () => {
    if (!validateClientForm()) {
      return;
    }

    const clientPayload = {
      nombre: name,
      email,
      telefono: phone,
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}clients/${editingClientId}`, clientPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}clients`, clientPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      setOpenDrawer(false);

      const updatedClientsResponse = await axios.get(`${API_BASE_URL}clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClients(updatedClientsResponse.data.data);
    } catch (createOrUpdateClientError) {
      console.error('Error al registrar o actualizar el cliente:', createOrUpdateClientError);
      alert('Error al registrar o actualizar el cliente, por favor verifica los datos.');
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}clients/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(`Cliente eliminado exitosamente.`);
      const updatedClientsResponse = await axios.get(`${API_BASE_URL}clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClients(updatedClientsResponse.data.data);
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      alert('Error al eliminar el cliente.');
    }
  };

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  if (apiError) {
    return <div>{apiError}</div>;
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Lista de Clientes</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={toggleDrawer(true)}
        >
          Crear nuevo cliente
        </Button>
      </Stack>

      <Card>
        <ClientTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ClientTableHead
                order={order}
                orderBy={orderBy}
                rowCount={clients.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'nombre', label: 'Nombre' },
                  { id: 'email', label: 'Correo Electrónico' },
                  { id: 'telefono', label: 'Teléfono' },
                  { id: ''},
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <ClientTableRow
                      key={row.id}
                      id={row.id}
                      name={row.nombre}
                      email={row.email}
                      phone={row.telefono}
                      selected={selected.indexOf(row.nombre) !== -1}
                      onEdit={toggleDrawer(true, row)}
                      onDelete={() => handleDeleteClient(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, clients.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Drawer anchor="right" open={openDrawer} onClose={toggleDrawer(false)}>
        <Container sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Editar cliente' : 'Registrar nuevo cliente'}
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
              label="Teléfono"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={phoneError}
              helperText={phoneError ? 'Completar este campo' : ''}
            />

            <Button variant="contained" onClick={handleCreateOrUpdateClient}>
              {isEditing ? 'Actualizar' : 'Registrar'}
            </Button>
          </Stack>
        </Container>
      </Drawer>
    </Container>
  );
}
