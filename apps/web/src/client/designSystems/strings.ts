export const strings = {
  app: {
    name: "RentPortal",
    tagline: "A rent management portal.",
  },

  nav: {
    manager: "Manager",
    tenant: "Tenant",
  },

  statusPill: {
    allPaid: "All Paid",
    paid: "Paid",
    outstanding: "Outstanding",
    overdue: "Overdue",
    vacant: "Vacant",
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
    },

    propertyDetail: {
      backLink: "Back to Dashboard",
      loading: "Loading property…",
      error: "Could not load property details.",
      errorRetry: "Try again",
      emptyTitle: "Property not found",
      emptyDescription: "This property does not exist or has been removed.",

      stats: {
        totalUnits: "Total Units",
        occupied: "Occupied",
        vacant: "Vacant",
        monthlyRent: "Monthly Rent",
        occupancySub: (leased: number, total: number) =>
          `${leased} of ${total} leased`,
        vacantSub: (count: number) => `${count} available`,
        rentSub: "across active leases",
      },

      unitsTable: {
        heading: (count: number) => `Units (${count})`,
        colUnit: "Unit",
        colTenant: "Tenant",
        colRent: "Monthly Rent",
        colLease: "Lease Period",
        colStatus: "Status",
        colAction: "",
        vacant: "Vacant",
        leasePeriod: (start: string, end: string) => `${start} – ${end}`,
        viewLink: "View",
        empty: "No units found",
        emptyDescription: "This property has no units yet.",
      },
    },
  },
} as const;
