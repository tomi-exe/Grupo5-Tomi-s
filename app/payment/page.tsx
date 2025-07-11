// app/payment/page.tsx

// Esto indica a Next.js que NUNCA prerenderice esta página
export const dynamic = "force-dynamic";

import React from "react";
import ClientPayment from "./ClientPayment";

export default function PaymentPage() {
  return <ClientPayment />;
}
