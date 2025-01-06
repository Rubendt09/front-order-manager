import { Helmet } from 'react-helmet-async';

import { OrderView } from 'src/sections/orders/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Order | Order Manager </title>
      </Helmet>

      <OrderView/>
    </>
  );
}
