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

  paymentTable: {
    colPeriod: "Period",
    colDue: "Amount Due",
    colPaid: "Amount Paid",
    colDate: "Paid Date",
    colMethod: "Method",
    colStatus: "Status",
    notPaid: "—",
    statusPill: {
      paid: "Paid",
      outstanding: "Outstanding",
      overdue: "Overdue",
    },
    actions: {
      sendReminder: "Send Reminder",
      lastReminderSent: "Last sent:",
      markPaid: "Mark as Paid",
      markingPaid: "Processing…",
      reminderToast: (tenantName: string) =>
        `Reminder sent to ${tenantName} for overdue rent.`,
    },
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

    tenantProfile: {
      backLink: "Back",
      loading: "Loading tenant profile…",
      error: "Could not load tenant profile.",
      emptyTitle: "Tenant not found",
      emptyDescription: "This tenant does not exist or has been removed.",

      info: {
        heading: "Tenant Info",
        name: "Name",
        email: "Email",
        contact: "Contact",
        kycStatus: "KYC Status",
        kycVerifiedOn: "Verified On",
        kycDocument: "KYC Document",
        kycDocumentLink: "View Document",
        kycDocumentNone: "Not uploaded",
        kycStatusLabels: {
          verified: "Verified",
          pending: "Pending",
          not_submitted: "Not Submitted",
        },
      },

      standing: {
        heading: "Payment Standing",
        score: "Score",
        totalPayments: "Total Payments",
        onTime: "On Time Payments",
        noData: "No payment history yet",
        labelColors: {
          Excellent: { bg: "bg-success-50", text: "text-success-700" },
          Good: { bg: "bg-brand-50", text: "text-brand-600" },
          Fair: { bg: "bg-warning-50", text: "text-warning-700" },
          Poor: { bg: "bg-danger-50", text: "text-danger-700" },
        },
      },

      lease: {
        heading: "Current Lease",
        property: "Property",
        unit: "Unit",
        monthlyRent: "Monthly Rent",
        leaseDate: "Lease Date",
        startDate: "Start Date",
        endDate: "End Date",
        terms: "Terms",
        leaseDocument: "Lease Document",
        leaseDocumentLink: "View Document",
        leaseDocumentNone: "Not uploaded",
        noLease: "No active lease",
      },

      payments: {
        heading: (count: number) => `Payment History (${count})`,
        loadingHistory: "Loading payments…",
        empty: "No payments recorded",
        colPeriod: "Period",
        colDue: "Amount Due",
        colPaid: "Amount Paid",
        colDate: "Paid Date",
        colMethod: "Method",
        colStatus: "Status",
        notPaid: "—",
      },

      statusPill: {
        paid: "Paid",
        outstanding: "Outstanding",
        overdue: "Overdue",
      },
    },

    unitDetail: {
      backLink: "Back to Property",
      loading: "Loading unit…",
      error: "Could not load unit details.",
      emptyTitle: "Unit not found",
      emptyDescription: "This unit does not exist or has been removed.",

      tenant: {
        heading: "Tenant",
        name: "Name",
        contact: "Contact",
        noTenant: "No tenant assigned",
        viewProfile: "View Tenant Profile",
      },

      lease: {
        heading: "Lease Details",
        monthlyRent: "Monthly Rent",
        leasePeriod: "Lease Period",
        terms: "Terms",
        leaseDocument: "Lease Document",
        leaseDocumentLink: "View Lease Document",
        leaseDocumentNone: "Not uploaded",
        noLease: "No active lease",
      },

      payments: {
        heading: (count: number) => `Payment History (${count})`,
        loadingHistory: "Loading payments…",
        empty: "No payments recorded",
        colPeriod: "Period",
        colDue: "Amount Due",
        colPaid: "Amount Paid",
        colDate: "Paid Date",
        colMethod: "Method",
        colStatus: "Status",
        colActions: "",
        notPaid: "—",
        sendReminder: "Send Reminder",
        markPaid: "Mark as Paid",
        reminderSent: "Reminder sent",
        markingPaid: "Processing…",
      },

      statusPill: {
        paid: "Paid",
        outstanding: "Outstanding",
        overdue: "Overdue",
        vacant: "Vacant",
      },
    },
  },
  tenant: {
    propertyInfo: {
      heading: "Property Details",
      name: "Property",
      address: "Address",
      unit: "Unit",
      noProperty: "No property assigned.",
    },
    managerInfo: {
      heading: "Property Manager",
      name: "Name",
      email: "Email",
      contact: "Contact",
      noManager: "No manager assigned.",
    },
    leaseDetails: {
      heading: "Lease Details",
      monthlyRent: "Monthly Rent",
      leasePeriod: "Lease Period",
      terms: "Terms",
      leaseDocument: "Lease Document",
      leaseDocumentLink: "View Document",
      leaseDocumentNone: "Not uploaded",
      noLease: "No active lease.",
    },
    dashboard: {
      heading: (name: string) => `Welcome back, ${name}`,
      loading: "Loading your dashboard…",
      emptyTitle: "Profile not found",
      emptyDescription: "Your tenant profile could not be loaded.",
      payments: {
        heading: (count: number) => `Payment History [${count}] `,
        empty: "No payment records yet.",
      },
    },
  },
} as const;
