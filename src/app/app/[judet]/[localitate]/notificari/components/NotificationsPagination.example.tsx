/**
 * NotificationsPagination Usage Example
 *
 * This file demonstrates how to use the NotificationsPagination component
 * in the main notificari page.
 */

import { useState } from "react";
import { NotificationsPagination } from "./NotificationsPagination";

// Example usage in page.tsx:

export default function NotificariPageExample() {
  // State from URL params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_page, setPage] = useState(1);

  // Pagination data from API
  const pagination = {
    page: 1,
    limit: 10,
    total: 45,
    total_pages: 5,
  };

  return (
    <div className="space-y-6">
      {/* ... NotificationsList ... */}

      {/* Pagination */}
      <NotificationsPagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

// Example pagination states:

// State 1: First page (1 of 5)
// Renders: "Afișez 1-10 din 45 notificări"
// Previous: disabled, Pages: [1] 2 3 4 5, Next: enabled
// { page: 1, limit: 10, total: 45, total_pages: 5 }

// State 2: Middle page (3 of 10)
// Renders: "Afișez 21-30 din 95 notificări"
// Previous: enabled, Pages: 1 ... [3] 4 5 ... 10, Next: enabled
// { page: 3, limit: 10, total: 95, total_pages: 10 }

// State 3: Last page (5 of 5)
// Renders: "Afișez 41-45 din 45 notificări"
// Previous: enabled, Pages: 1 2 3 4 [5], Next: disabled
// { page: 5, limit: 10, total: 45, total_pages: 5 }

// State 4: Only 1 page (component hidden)
// Renders: null (component hidden when total_pages <= 1)
// { page: 1, limit: 10, total: 8, total_pages: 1 }
