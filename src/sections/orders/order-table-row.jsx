/* eslint-disable */

import { useState } from 'react';
import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function OrderTableRow({
  selected,
  cliente,
  estado,
  descripcion,
  fechaPedido,
  total,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEditClick = () => {
    handleCloseMenu(); // Cierra el menú de opciones
    onEdit(); // Abre el drawer de edición
  };

  const handleDeleteClick = () => {
    handleCloseMenu(); // Cierra el menú
    onDelete(); // Llama a la función de eliminación desde el componente principal
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell>{cliente}</TableCell>
        <TableCell>{estado}</TableCell>
        <TableCell>{descripcion}</TableCell>
        <TableCell>{new Date(fechaPedido).toLocaleDateString()}</TableCell>
        <TableCell>{total}</TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Editar
        </MenuItem>

        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Eliminar
        </MenuItem>
      </Popover>
    </>
  );
}

OrderTableRow.propTypes = {
  cliente: PropTypes.string.isRequired,
  estado: PropTypes.string.isRequired,
  descripcion: PropTypes.string.isRequired,
  fechaPedido: PropTypes.string.isRequired,
  total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  selected: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,  
  onDelete: PropTypes.func.isRequired,
};
