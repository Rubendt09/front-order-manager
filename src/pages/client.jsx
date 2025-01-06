import { Helmet } from 'react-helmet-async';

import { ClientView } from 'src/sections/clients/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Client | Order Manager </title>
      </Helmet>

      <ClientView />
    </>
  );
}
