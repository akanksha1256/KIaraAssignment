export const strings = {
  app: {
    name: "RentPortal",
    tagline: "A rent management portal.",
  },

  nav: {
    manager: "Manager",
    tenant: "Tenant",
  },

  manager: {
    dashboard: {
      title: "Manager Dashboard",
      subtitle: "Overview of your portfolio performance.",

      loading: "Loading dashboard…",
      error: "Could not load dashboard data.",
      errorRetry: "Try again",
      emptyTitle: "No data yet",
      emptyDescription: "Add properties to see your dashboard.",

      stats: {
        properties: "Properties",
        propertiesSubtitle: (total: number) => `${total} total units`,
        occupancy: "Occupancy",
        occupancySubtitle: (vacant: number) => `${vacant} vacant`,
        monthlyRent: "Monthly Rent",
        monthlyRentSubtitle: "across active leases",
        collectionRate: "Collection Rate",
        collectionRateSubtitle: (amount: string) => `${amount} collected`,
      },

      revenueChart: {
        title: "Monthly Revenue",
        subtitle: "Expected vs collected over last 6 months",
        barExpected: "Expected",
        barCollected: "Collected",
        empty: "No revenue data",
      },

      paymentChart: {
        title: "Payment Status",
        subtitle: "Breakdown across all leases",
        paid: "Paid",
        outstanding: "Outstanding",
        overdue: "Overdue",
        empty: "No payment data",
      },

      propertiesTable: {
        heading: (count: number) => `Properties (${count})`,
        colId: "ID",
        colName: "Property Name",
        colAddress: "Address",
        colUnits: "Units",
        colRent: "Monthly Rent",
        colStatus: "Status",
        occupiedSuffix: "occupied",
        viewLink: "View",
        empty: "No properties",
        emptyDescription: "Add your first property to get started.",
      },

      statusPill: {
        paid: "All Paid",
        outstanding: "Outstanding",
        overdue: "Overdue",
        vacant: "Vacant",
      },
    },
  },
} as const;
