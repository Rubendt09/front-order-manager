/* eslint-disable */

import axios from 'axios';
import { useState, useEffect } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
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
import MenuItem from '@mui/material/MenuItem';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import OrderTableRow from '../order-table-row';
import OrderTableHead from '../order-table-head';
import TableEmptyRows from '../table-empty-rows';
import OrderTableToolbar from '../order-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function OrderView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('cliente');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orders, setOrders] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [cliente, setCliente] = useState(null);
  const [estado, setEstado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const [clienteError, setClienteError] = useState(false);
  const [estadoError, setEstadoError] = useState(false);
  const [descripcionError, setDescripcionError] = useState(false);
  const [totalError, setTotalError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrdersClientsStates = async () => {
      try {
        const [ordersResponse, clientsResponse, statesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}orders`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_BASE_URL}clients`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_BASE_URL}states`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        setOrders(ordersResponse.data.data);
        setClientes(clientsResponse.data.data);
        setEstados(statesResponse.data.data);
        setLoading(false);
      } catch (fetchError) {
        console.error('Error al obtener datos:', fetchError);
        setApiError('Error al cargar datos');
        setLoading(false);
      }
    };

    fetchOrdersClientsStates();
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
    inputData: orders,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const toggleDrawer =
    (open, order = null) =>
    () => {
      setOpenDrawer(open);
      setIsEditing(!!order);

      if (order) {
        setCliente(clientes.find((c) => c.nombre === order.cliente) || null);
        setEstado(order.estado);
        setDescripcion(order.descripcion);
        setTotal(order.total);
        setEditingOrderId(order.id);
      } else {
        setCliente(null);
        setEstado('');
        setDescripcion('');
        setTotal('');
        setEditingOrderId(null);
      }

      setClienteError(false);
      setEstadoError(false);
      setDescripcionError(false);
      setTotalError(false);
    };

  const validateOrderForm = () => {
    let valid = true;

    if (!cliente) {
      setClienteError(true);
      valid = false;
    } else {
      setClienteError(false);
    }

    if (!estado) {
      setEstadoError(true);
      valid = false;
    } else {
      setEstadoError(false);
    }

    if (!descripcion) {
      setDescripcionError(true);
      valid = false;
    } else {
      setDescripcionError(false);
    }

    if (!total || isNaN(total)) {
      setTotalError(true);
      valid = false;
    } else {
      setTotalError(false);
    }

    return valid;
  };

  const handleCreateOrUpdateOrder = async () => {
    if (!validateOrderForm()) {
      return;
    }

    const orderPayload = {
      cliente_id: cliente.id,
      estado_id: estados.find((e) => e.nombre === estado)?.id,
      descripcion,
      total,
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}orders/${editingOrderId}`, orderPayload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post(`${API_BASE_URL}orders`, orderPayload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }

      setOpenDrawer(false);

      const updatedOrdersResponse = await axios.get(`${API_BASE_URL}orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrders(updatedOrdersResponse.data.data);
    } catch (createOrUpdateOrderError) {
      console.error('Error al guardar la orden:', createOrUpdateOrderError);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta orden?');
      if (!confirmDelete) return;

      await axios.delete(`${API_BASE_URL}orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      alert('Orden eliminada exitosamente.');

      const updatedOrdersResponse = await axios.get(`${API_BASE_URL}orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrders(updatedOrdersResponse.data.data);
    } catch (error) {
      console.error('Error al eliminar la orden:', error);
      alert('Hubo un error al eliminar la orden. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return <div>Cargando órdenes...</div>;
  }

  if (apiError) {
    return <div>{apiError}</div>;
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Lista de Órdenes</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={toggleDrawer(true)}
        >
          Crear nueva orden
        </Button>
      </Stack>

      <Card>
        <OrderTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <OrderTableHead
                order={order}
                orderBy={orderBy}
                rowCount={orders.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'cliente', label: 'Cliente' },
                  { id: 'estado', label: 'Estado' },
                  { id: 'descripcion', label: 'Descripción' },
                  { id: 'fecha_pedido', label: 'Fecha Pedido' },
                  { id: 'total', label: 'Total' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <OrderTableRow
                      key={row.id}
                      id={row.id}
                      cliente={row.cliente}
                      estado={row.estado}
                      descripcion={row.descripcion}
                      fechaPedido={row.fecha_pedido}
                      total={row.total}
                      selected={selected.indexOf(row.id) !== -1}
                      onEdit={toggleDrawer(true, row)}
                      onDelete={() => handleDeleteOrder(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, orders.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Drawer anchor="right" open={openDrawer} onClose={toggleDrawer(false)}>
        <Container sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isEditing ? 'Editar orden' : 'Registrar nueva orden'}
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => `${option.nombre}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  error={clienteError}
                  helperText={clienteError ? 'Debe seleccionar un cliente' : ''}
                />
              )}
              onChange={(event, value) => setCliente(value || null)}
              value={cliente}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <TextField
              select
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              error={estadoError}
              helperText={estadoError ? 'Debe seleccionar un estado' : ''}
            >
              {estados.map((estado) => (
                <MenuItem key={estado.id} value={estado.nombre}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Descripción"
              fullWidth
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              error={descripcionError}
              helperText={descripcionError ? 'Completar este campo' : ''}
            />
            <TextField
              label="Total"
              fullWidth
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              error={totalError}
              helperText={totalError ? 'Debe ser un número válido' : ''}
            />
            <Button variant="contained" onClick={handleCreateOrUpdateOrder}>
              {isEditing ? 'Actualizar Orden' : 'Crear Orden'}
            </Button>
          </Stack>
        </Container>
      </Drawer>
    </Container>
  );
}
